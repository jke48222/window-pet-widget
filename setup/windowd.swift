// windowd — a tiny window-geometry daemon for the window-pet Übersicht widget.
//
// Polls CGWindowListCopyWindowInfo (bounds, layer, PID, z-order: no permissions,
// no window titles, no owner names) and streams the on-screen window layout to
// the widget as server-sent events on 127.0.0.1. Nothing leaves the machine.
//
//   windowd            serve  http://127.0.0.1:41727/events  (SSE) and /windows (JSON)
//   windowd --once     print one JSON snapshot and exit
//   windowd --port N   listen on another port
import Foundation
import AppKit
import Network

struct Win: Codable { let id: UInt32; let pid: Int32; let x: Double; let y: Double; let w: Double; let h: Double; let z: Int }
struct Disp: Codable { let id: UInt32; let x: Double; let y: Double; let w: Double; let h: Double; let vx: Double; let vy: Double; let vw: Double; let vh: Double; let main: Bool }
struct Snap: Codable { let t: Double; let windows: [Win]; let displays: [Disp] }

func displays() -> [Disp] {
    let screens = NSScreen.screens
    guard let primary = screens.first else { return [] }
    let ph = primary.frame.height
    return screens.map { s in
        let f = s.frame, v = s.visibleFrame
        let id = (s.deviceDescription[NSDeviceDescriptionKey("NSScreenNumber")] as? NSNumber)?.uint32Value ?? 0
        return Disp(id: id, x: f.origin.x, y: ph - (f.origin.y + f.height), w: f.width, h: f.height,
                    vx: v.origin.x, vy: ph - (v.origin.y + v.height), vw: v.width, vh: v.height, main: s == primary)
    }
}

func snapshot() -> Snap {
    let opts: CGWindowListOption = [.optionOnScreenOnly, .excludeDesktopElements]
    var wins: [Win] = []
    if let raw = CGWindowListCopyWindowInfo(opts, kCGNullWindowID) as? [[String: Any]] {
        var z = 0
        for d in raw {
            let layer = (d[kCGWindowLayer as String] as? NSNumber)?.intValue ?? -1
            guard layer == 0 else { continue }
            let alpha = (d[kCGWindowAlpha as String] as? NSNumber)?.doubleValue ?? 1
            guard alpha > 0.05 else { continue }
            guard let idN = d[kCGWindowNumber as String] as? NSNumber, let pidN = d[kCGWindowOwnerPID as String] as? NSNumber,
                  let bd = d[kCGWindowBounds as String] as? NSDictionary, let r = CGRect(dictionaryRepresentation: bd) else { continue }
            guard r.width >= 120, r.height >= 60 else { continue }
            wins.append(Win(id: idN.uint32Value, pid: pidN.int32Value, x: r.origin.x, y: r.origin.y, w: r.width, h: r.height, z: z))
            z += 1
        }
    }
    return Snap(t: Date().timeIntervalSince1970, windows: wins, displays: displays())
}

func json(_ s: Snap) -> String {
    let enc = JSONEncoder()
    return (try? String(data: enc.encode(s), encoding: .utf8) ?? "{}") ?? "{}"
}

final class Server {
    let listener: NWListener
    let q = DispatchQueue(label: "windowd.server")
    var streams: [NWConnection] = []
    var latest = "{}"

    init(port: UInt16) throws {
        let params = NWParameters.tcp
        params.allowLocalEndpointReuse = true
        params.requiredInterfaceType = .loopback
        listener = try NWListener(using: params, on: NWEndpoint.Port(rawValue: port)!)
        listener.newConnectionHandler = { [weak self] c in self?.accept(c) }
        listener.start(queue: q)
    }
    func accept(_ c: NWConnection) {
        c.stateUpdateHandler = { [weak self] st in
            switch st { case .failed, .cancelled: self?.streams.removeAll { $0 === c }; default: break }
        }
        c.start(queue: q)
        c.receive(minimumIncompleteLength: 1, maximumLength: 16384) { [weak self] data, _, _, _ in
            guard let self = self, let d = data, let req = String(data: d, encoding: .utf8) else { c.cancel(); return }
            let first = req.components(separatedBy: "\r\n").first ?? ""
            let parts = first.split(separator: " ")
            let path = parts.count > 1 ? String(parts[1]) : "/"
            self.respond(c, path: path)
        }
    }
    func send(_ c: NWConnection, _ s: String, close: Bool) {
        c.send(content: s.data(using: .utf8), completion: .contentProcessed { _ in if close { c.cancel() } })
    }
    func respond(_ c: NWConnection, path: String) {
        let cors = "Access-Control-Allow-Origin: *\r\n"
        if path.hasPrefix("/events") {
            send(c, "HTTP/1.1 200 OK\r\nContent-Type: text/event-stream\r\nCache-Control: no-cache\r\nConnection: keep-alive\r\n" + cors + "\r\n" + "data: \(latest)\n\n", close: false)
            streams.append(c)
        } else if path.hasPrefix("/windows") {
            let body = latest
            send(c, "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: \(body.utf8.count)\r\nConnection: close\r\n" + cors + "\r\n" + body, close: true)
        } else {
            let body = "windowd ok\n"
            send(c, "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: \(body.utf8.count)\r\nConnection: close\r\n" + cors + "\r\n" + body, close: true)
        }
    }
    func broadcast(_ s: String) {
        latest = s
        guard !streams.isEmpty, let payload = "data: \(s)\n\n".data(using: .utf8) else { return }
        for c in streams { c.send(content: payload, completion: .contentProcessed { err in if err != nil { c.cancel() } }) }
    }
}

let args = CommandLine.arguments
if args.contains("--once") { print(json(snapshot())); exit(0) }
var port: UInt16 = 41727
if let i = args.firstIndex(of: "--port"), i + 1 < args.count, let p = UInt16(args[i + 1]) { port = p }
let server: Server
do { server = try Server(port: port) } catch { FileHandle.standardError.write("windowd: cannot listen on \(port): \(error)\n".data(using: .utf8)!); exit(1) }
var last = ""; var lastSent = Date()
let timer = DispatchSource.makeTimerSource(queue: server.q)
timer.schedule(deadline: .now(), repeating: .milliseconds(50))
timer.setEventHandler {
    let s = json(snapshot())
    let heartbeat = Date().timeIntervalSince(lastSent) > 1.0
    if s != last || heartbeat { server.broadcast(s); last = s; lastSent = Date() }
}
timer.resume()
FileHandle.standardError.write("windowd: serving http://127.0.0.1:\(port)/events\n".data(using: .utf8)!)
dispatchMain()
