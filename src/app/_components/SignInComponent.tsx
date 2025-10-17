/**
 * SignInComponent.tsx
 *
 * This is a super simple sign-in button for beginners to understand!
 * Think of this like a doorbell - when you press it, something happens.
 *
 * What this component does:
 * 1. Shows a "Sign In" button
 * 2. When you click it, it tries to sign you in
 * 3. That's it! Simple and easy.
 */

"use client"; // This tells Next.js this component runs in the browser, not on the server

// These are like importing tools we need to build our component
import { signIn } from "next-auth/react"; // This is the magic tool that handles sign-in

/**
 * What is a React Component?
 * Think of it like a LEGO block that creates a piece of your website.
 * This particular block creates just one button.
 */
export default function SignInComponent() {
  /**
   * This function runs when someone clicks the "Sign In" button
   * Think of it like instructions for what to do when the button is pressed
   */
  const handleSignIn = async () => {
    /**
     * signIn() is a special function from NextAuth that:
     * 1. Opens a sign-in popup or page
     * 2. Lets users sign in with Google, GitHub, etc.
     * 3. Handles all the complicated security stuff for us
     *
     * It's like having a professional security guard handle the door
     * instead of us having to check everyone's ID ourselves!
     */
    await signIn();
  };

  /**
   * This is what gets shown on the screen (the HTML/JSX)
   * JSX is like HTML but with superpowers for React
   */
  return (
    <button
      onClick={handleSignIn} // When clicked, run our handleSignIn function
      className="rounded-lg bg-blue-500 px-6 py-2 text-white transition duration-200 hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
    >
      Sign In
    </button>
  );
}

/**
 * How to use this component:
 *
 * 1. Import it in another file:
 *    import SignInComponent from './SignInComponent';
 *
 * 2. Use it like this:
 *    <SignInComponent />
 *
 * Example:
 * function MyPage() {
 *   return (
 *     <div>
 *       <h1>Welcome to my website!</h1>
 *       <SignInComponent />
 *     </div>
 *   );
 * }
 *
 * What happens when you use this:
 * - A blue "Sign In" button appears
 * - When users click it, they get taken to a sign-in page
 * - They can sign in with whatever methods you've set up (Google, GitHub, etc.)
 * - After signing in, they come back to your website logged in!
 */
