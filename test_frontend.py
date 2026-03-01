import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Go to the local VDR page (using French by default as the site might be set up this way based on our route memory)
        # Note: Local next server might be running on 3001 or 3000. Let's try to access it.
        # But wait, memory says: "The local Next.js development server runs on port 3001"
        try:
            await page.goto('http://localhost:3001/en')
            # wait for animation
            await asyncio.sleep(4)
            await page.screenshot(path='/tmp/login-gate.png', full_page=True)
            print("Screenshot captured to /tmp/login-gate.png")
        except Exception as e:
            print(f"Error connecting to page: {e}")

        await browser.close()

asyncio.run(main())
