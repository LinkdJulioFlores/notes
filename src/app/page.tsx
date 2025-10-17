/**
 * page.tsx - The Main Home Page
 *
 * This is like the front door of your website!
 * When someone visits your website, this is the first thing they see.
 *
 * Think of it like this:
 * - If someone is already signed in → Show them the main app (HomeComponent)
 * - If someone is NOT signed in → Show them a sign-in button
 *
 * It's like a bouncer at a club who checks if you're on the guest list!
 */

"use client"; // This tells Next.js this page runs in the browser

// These are like importing different tools we need
import { signOut, useSession } from "next-auth/react"; // Tools for checking if someone is signed in
import HomeComponent from "./_components/HomeComponent"; // The main app that signed-in users see
import SignInComponent from "./_components/SignInComponent"; // Our simple sign-in button

/**
 * This is the main function that creates our home page
 * Think of it as the blueprint for what visitors see when they come to your website
 */
export default function Home() {
  /**
   * useSession() is like asking "Hey, is anyone signed in right now?"
   *
   * It gives us back information:
   * - session.user = the person who is signed in (if anyone)
   * - session = null if nobody is signed in
   *
   * Think of it like checking if someone has a valid ticket at a movie theater
   */
  const { data: session } = useSession();

  /**
   * This function runs when someone clicks the "Sign Out" button
   * It's like walking someone to the exit door
   */
  const handleSignOut = async () => {
    await signOut(); // This logs the person out and clears their "ticket"
  };

  /**
   * This is what gets shown on the screen
   * We use something called "conditional rendering" - fancy words for:
   * "Show different things depending on what's happening"
   */
  return (
    <div className="min-h-screen bg-gray-50">
      {/*
        This is like an IF statement in regular English:
        IF someone is signed in, THEN show them the main app
      */}
      {session ? (
        // This section shows when someone IS signed in
        <div>
          {/* Welcome message with the user's name */}
          <div className="border-b bg-white p-4 shadow-sm">
            <div className="mx-auto flex max-w-4xl items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-800">
                Welcome back, {session.user?.name ?? "Friend"}! 👋
              </h1>

              {/* Sign out button */}
              <button
                onClick={handleSignOut}
                className="rounded-lg bg-red-500 px-4 py-2 text-white transition duration-200 hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* The main app content */}
          <div className="mx-auto max-w-4xl p-4">
            <HomeComponent />
          </div>
        </div>
      ) : (
        // This section shows when someone is NOT signed in
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            {/* Welcome message for visitors */}
            <h1 className="mb-4 text-4xl font-bold text-gray-800">
              Welcome to Our App! 🎉
            </h1>

            <p className="mb-8 max-w-md text-lg text-gray-600">
              Please sign in to access all the cool features and start using our
              app.
            </p>

            {/* Our simple sign-in button component */}
            <SignInComponent />

            {/* Optional: Some info about what they'll get after signing in */}
            <div className="mt-8 text-sm text-gray-500">
              <p>By signing in, you&apos;ll be able to:</p>
              <ul className="mt-2 space-y-1">
                <li>• Access your personal dashboard</li>
                <li>• Save your preferences</li>
                <li>• Use all app features</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * How this page works - Step by Step:
 *
 * 1. Someone visits your website
 * 2. The page checks: "Are they signed in?"
 * 3. If YES:
 *    - Shows "Welcome back, [Name]!"
 *    - Shows the main app (HomeComponent)
 *    - Shows a "Sign Out" button
 * 4. If NO:
 *    - Shows "Welcome to Our App!"
 *    - Shows the SignInComponent button
 *    - Shows some helpful info about signing in
 *
 * Why this is good:
 * - Users know exactly what to do
 * - Signed-in users get right to their stuff
 * - New visitors get a friendly welcome
 * - Everything is secure (NextAuth handles the hard parts)
 *
 * Think of it like a smart receptionist who:
 * - Recognizes returning customers and lets them in
 * - Greets new visitors and helps them get started
 * - Always knows who belongs where
 */
