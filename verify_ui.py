from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the dashboard
        # Assuming the dev server is running on localhost:3000
        # and there's a login bypass or default state we can access
        try:
            page.goto("http://localhost:3000")

            # Wait for main content to load
            page.wait_for_selector("main", timeout=10000)

            # Take a full page screenshot
            page.screenshot(path="verification_dashboard.png", full_page=True)
            print("Dashboard screenshot captured: verification_dashboard.png")

            # Try to navigate to other views if possible (e.g. via sidebar)
            # This is a basic smoke test visual verification

        except Exception as e:
            print(f"Error during verification: {e}")
            # Take a screenshot of the error state if possible
            try:
                page.screenshot(path="verification_error.png")
            except:
                pass
        finally:
            browser.close()

if __name__ == "__main__":
    run()
