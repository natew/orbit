//
//  AppDelegate.swift
//  SwindlerExample
//
//  Created by Tyler Mandry on 10/20/15.
//  Copyright © 2015 Tyler Mandry. All rights reserved.
//

import AXSwift
import class AXSwift.Application
import class AXSwift.Observer
import Cocoa
import Swindler
import PromiseKit
import Darwin

func dispatchAfter(delay: TimeInterval, block: DispatchWorkItem) {
    let time = DispatchTime.now() + delay
    DispatchQueue.main.asyncAfter(deadline: time, execute: block)
}

class AppDelegate: NSObject, NSApplicationDelegate {
    var swindler: Swindler.State!
    var observer: Observer!

    func emit(_ firstThing: String) {
        fputs("\(firstThing)\n", __stderrp)
    }

    func applicationDidFinishLaunching(_ aNotification: Notification) {
        emit("Loading");
        guard AXSwift.checkIsProcessTrusted(prompt: true) else {
            emit("Not trusted as an AX process; please authorize and re-launch")
            NSApp.terminate(self)
            return
        }

        swindler = Swindler.state

//        emit("screens: \(swindler.screens)")

        swindler.on { (event: WindowCreatedEvent) in
            let window = event.window
            self.emit(":WindowCreatedEvent \(window.title.value)")
        }
        swindler.on { (event: WindowPosChangedEvent) in
            self.emit(":WindowPosChangedEvent \(event.newValue)")
        }
        swindler.on { (event: WindowSizeChangedEvent) in
            self.emit(":WindowSizeChangedEvent \(event.newValue)")
        }
        swindler.on { (event: WindowDestroyedEvent) in
            self.emit(":WindowDestroyedEvent \(event.window.title.value)")
        }
        swindler.on { (event: ApplicationMainWindowChangedEvent) in
//            self.emit(":ApplicationMainWindowChangedEvent \(String(describing: event.newValue?.title.value))")
            self.frontmostWindowChanged("")
        }
        swindler.on { (event: FrontmostApplicationChangedEvent) in
            let id = (event.newValue!.bundleIdentifier ?? "").replacingOccurrences(of: "\"", with: "")
            let idString = (id != "") ?
                "\"id\": \"\(String(describing: id))\", " :
                ""
            self.frontmostWindowChanged(idString)
//            self.watchApp(id)
        }
        swindler.on { (event: WindowTitleChangedEvent) in
            self.frontmostWindowChanged("")
        }

        //    dispatchAfter(10.0) {
        //      for window in self.swindler.knownWindows {
        //        let title = window.title.value
        //        emit("resizing \(title)")
        //        window.size.set(CGSize(width: 200, height: 200)).then { newValue in
        //          emit("done with \(title), valid: \(window.isValid), newValue: \(newValue)")
        //        }.error { error in
        //          emit("failed to resize \(title), valid: \(window.isValid), error: \(error)")
        //        }
        //      }
        //    }
    }

    private func frontmostWindowChanged(_ extraString: String) {
        let frontWindow = swindler.frontmostApplication.value?.mainWindow.value!
        if (frontWindow == nil) {
            return
        }
        let window = frontWindow!
        let title = String(window.title.value).replacingOccurrences(of: "\"", with: "")
        let titleString = "\"\(title)\"";
        let offset = window.position.value
        let bounds = window.size.value
        self.emit(":FrontmostWindowChangedEvent { \(extraString) \"title\": \(titleString), \"offset\": [\(offset.x),\(offset.y)], \"bounds\": [\(bounds.width),\(bounds.height)] }")
    }
    
//    private func watchApp(_ id: String) {
//        let app = Application.allForBundleID(id).first!
//        do {
//            try self.watchApp(app)
//        } catch let error {
//            self.emit("Error: Could not watch app [\(app)]: \(error)")
//        }
//    }
//
//    func watchApp(_ app: Application) throws {
//        var updated = false
//        if (observer != nil) {
//            observer.stop()
//        }
//        let send = self.emit
//        let attributes = try! app.attributes()
//        self.emit(":AppAttributes \(attributes)")
//        observer = app.createObserver { (observer: Observer, element: UIElement, event: AXNotification, info: [String: AnyObject]?) in
//            var elementDesc: String!
//            if let role = try? element.role()!, role == .window {
//                elementDesc = "\(element) \"\(try! (element.attribute(.title) as String?)!)\""
//            } else {
//                elementDesc = "\(element)"
//            }
//            send(":Something \(event) on \(elementDesc); info: \(info ?? [:])")
//
//            // Group simultaneous events together with --- lines
//            if !updated {
//                updated = true
//                // Set this code to run after the current run loop, which is dispatching all notifications.
//                DispatchQueue.main.async {
//                    send("---")
//                    updated = false
//                }
//            }
//        }
//    }

    func applicationWillTerminate(_ aNotification: Notification) {
        // Insert code here to tear down your application
        emit("Exit");
    }
}
