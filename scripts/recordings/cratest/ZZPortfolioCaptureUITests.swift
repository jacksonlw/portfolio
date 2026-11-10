import XCTest

// TEMPORARY (portfolio capture). capture.sh copies this into ~/cratest/mobile/ios/CratestUITests,
// runs it, and deletes it. It talks to capture.sh's host-side watcher through marker files in
// CAPTURE_DIR: the watcher takes simctl screenshots and recordings when asked.
// Uses helpers from the app's own UI test target (UITestSupport.swift, GamesUITestAPI in
// GamesCrateDiggerUITests.swift).
@MainActor
final class ZZPortfolioCaptureUITests: XCTestCase {
    private var app: XCUIApplication!
    private var dir: String { ProcessInfo.processInfo.environment["CAPTURE_DIR"] ?? "/tmp" }

    override func setUp() async throws {
        continueAfterFailure = true
        app = XCUIApplication()
    }

    private func ask(_ what: String) {
        let req = "\(dir)/req-\(what)"
        let ack = "\(dir)/ack-\(what)"
        try? FileManager.default.removeItem(atPath: ack)
        FileManager.default.createFile(atPath: req, contents: Data())
        let deadline = Date().addingTimeInterval(60)
        while Date() < deadline, !FileManager.default.fileExists(atPath: ack) {
            RunLoop.current.run(until: Date().addingTimeInterval(0.1))
        }
    }
    private func shot(_ name: String) { ask("shot-\(name)") }
    private func recStart(_ name: String) { ask("recstart-\(name)") }
    private func recStop(_ name: String) { ask("recstop-\(name)") }
    private func pause(_ s: TimeInterval) { RunLoop.current.run(until: Date().addingTimeInterval(s)) }

    private func drag(_ el: XCUIElement, dx: CGFloat, dy: CGFloat = 0, velocity: CGFloat = 900) {
        let start = el.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.55))
        start.press(forDuration: 0.08, thenDragTo: start.withOffset(CGVector(dx: dx, dy: dy)),
                    withVelocity: XCUIGestureVelocity(velocity), thenHoldForDuration: 0)
    }

    /// Drags across the deck's stars; the control rounds up to half steps (ceil(x / width * 10)).
    private func rate(to fraction: CGFloat) {
        let r = app.deckRating
        let from = r.coordinate(withNormalizedOffset: CGVector(dx: 0.04, dy: 0.5))
        let to = r.coordinate(withNormalizedOffset: CGVector(dx: fraction, dy: 0.5))
        from.press(forDuration: 0.12, thenDragTo: to, withVelocity: XCUIGestureVelocity(260), thenHoldForDuration: 0.25)
    }

    func test1Onboarding() {
        app.launchFresh(skipOnboarding: false, animations: true, appearance: "light")
        XCTAssertTrue(app.staticTexts["What do you dig?"].waitForExistence(timeout: 30))
        pause(1)
        for g in ["Rock", "Jazz", "R&B/Soul", "Electronic/Dance"] where app.buttons[g].exists { app.buttons[g].tap(); pause(0.3) }
        pause(1)
        shot("onboarding-genres")
    }

    func test2Deck() {
        app.launchFresh(skipOnboarding: false, animations: true, appearance: "light")
        XCTAssertTrue(app.staticTexts["What do you dig?"].waitForExistence(timeout: 30))
        for g in ["Rock", "Alternative/Indie", "R&B/Soul"] where app.buttons[g].exists { app.buttons[g].tap() }
        app.buttons["Start digging"].tap()
        XCTAssertTrue(app.deckCard.waitForExistence(timeout: 30))
        pause(4)
        shot("review-deck")
        rate(to: 0.66)  // 3.5 stars
        pause(0.8)
        shot("rating")
        // Send the first review before recording: a guest's first review may raise the sign-in sheet.
        app.deckSave.tap()
        pause(1.5)
        app.dismissSignInSheet(timeout: 4)
        pause(3)

        recStart("swipe")
        pause(0.8)
        drag(app.deckCard, dx: -300, dy: 20, velocity: 1100)   // skip
        pause(1.3)
        drag(app.deckCard, dx: 300, dy: 10, velocity: 1100)    // haven't heard it
        pause(1.5)
        rate(to: 0.86)  // 4.5 stars
        pause(0.9)
        app.deckSave.tap()                                     // up into the Crate
        pause(2.5)
        recStop("swipe")
        app.dismissSignInSheet(timeout: 3)
    }

    func test3Crate() {
        app.launchFresh(seedReviews: 20, animations: true, appearance: "light")
        app.openTab("Crate")
        XCTAssertTrue(app.staticTexts["Your crate"].waitForExistence(timeout: 30))
        pause(5)
        shot("crate")
        app.swipeUp(velocity: 600)
        pause(3)
        shot("crate-shelves")
    }

    func test4CrateDigger() async throws {
        let answer = try await GamesUITestAPI.answer(kind: "cratedigger")
        let wrong = try await GamesUITestAPI.searchableItems(type: "artist", avoiding: answer.id, count: 3)
        app.launchFresh(animations: true, appearance: "light")
        app.openTab("Games")
        let card = app.element("games.card.cratedigger")
        XCTAssertTrue(card.waitForExistence(timeout: 30))
        pause(4)
        shot("games")
        card.tap()
        XCTAssertTrue(app.element("crateDigger.guessField").waitForExistence(timeout: 20))
        pause(2)
        recStart("crate-digger")
        pause(0.6)
        GamesUITestAPI.pick(wrong[0], in: app, test: self)
        XCTAssertTrue(app.element("crateDigger.row.1").waitForExistence(timeout: 15))
        pause(2.2)
        GamesUITestAPI.pick(wrong[1], in: app, test: self)
        XCTAssertTrue(app.element("crateDigger.row.2").waitForExistence(timeout: 15))
        pause(2.5)
        recStop("crate-digger")
        GamesUITestAPI.pick(wrong[2], in: app, test: self)
        XCTAssertTrue(app.element("crateDigger.row.3").waitForExistence(timeout: 15))
        app.swipeDown(velocity: .fast)
        pause(2.5)
        shot("crate-digger")
    }

    func test5CoverStory() async throws {
        let answer = try await GamesUITestAPI.answer(kind: "coverstory")
        let wrong = try await GamesUITestAPI.searchableItems(type: "album", avoiding: answer.id, count: 1)
        app.launchFresh(animations: true, appearance: "light")
        app.openTab("Games")
        let card = app.element("games.card.coverstory")
        XCTAssertTrue(card.waitForExistence(timeout: 30))
        card.tap()
        XCTAssertTrue(app.element("coverStory.image").waitForExistence(timeout: 20))
        XCTAssertTrue(app.buttons["coverStory.skip"].waitForExistence(timeout: 10))
        pause(3)
        recStart("cover-story")
        pause(1)
        app.buttons["coverStory.skip"].tap()
        XCTAssertTrue(waitUntil(app.element("coverStory.image"), "label CONTAINS 'step 2 of'", timeout: 15))
        pause(2)
        _ = waitUntil(app.buttons["coverStory.skip"], "enabled == true", timeout: 15)
        app.buttons["coverStory.skip"].tap()
        XCTAssertTrue(waitUntil(app.element("coverStory.image"), "label CONTAINS 'step 3 of'", timeout: 15))
        pause(2)
        _ = waitUntil(app.buttons["coverStory.skip"], "enabled == true", timeout: 15)
        app.buttons["coverStory.skip"].tap()
        _ = waitUntil(app.element("coverStory.image"), "label CONTAINS 'step 4 of'", timeout: 15)
        pause(4)
        recStop("cover-story")
        GamesUITestAPI.pick(wrong[0], in: app, test: self)
        _ = app.element("coverStory.guess.4").waitForExistence(timeout: 15)
        app.swipeDown(velocity: .fast)
        pause(2.5)
        shot("cover-story")
    }

    func test6ShareCard() async throws {
        let album = try await UITestSupport.anAlbum()
        app.launchFresh(animations: true, appearance: "light", link: UITestSupport.link(to: album))
        XCTAssertTrue(app.buttons["shareItem"].waitForExistence(timeout: 30))
        pause(3)
        shot("item-page")
        app.buttons["shareItem"].tap()
        let sheet = app.descendants(matching: .any)["ActivityListView"]
        _ = sheet.waitForExistence(timeout: 20) || app.buttons["Copy"].waitForExistence(timeout: 5)
        pause(3)
        shot("share-card")
    }
}
