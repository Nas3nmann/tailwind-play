export const defaultBodyContent = `
<div class="bg-neutral-800 backdrop-blur-lg rounded-2xl p-8 max-w-md mx-auto mt-20 shadow-2xl">
  <h1 class="text-4xl font-bold text-neutral-50 mb-4">Welcome to HTML Editor! 👋</h1>
  <p class="text-neutral-400 mb-6">Edit the HTML on the left to see live changes here. Tailwind CSS is already loaded!</p>
  <button 
    class="bg-neutral-50 text-neutral-900 px-6 py-3 rounded-lg font-semibold hover:bg-neutral-100 transition-colors duration-200 cursor-pointer">
    Click me!
  </button>
</div>
`

export const defaultTailwindConfig = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [],
}`

export function wrapWithHtmlTemplate(bodyContent: string): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Preview</title>
      <script src="https://cdn.tailwindcss.com"><\/script>
    </head>
    <body class="bg-linear-to-br from-purple-500 to-pink-500 min-h-screen p-8">
      ${bodyContent}
    </body>
  </html>
  `
}
