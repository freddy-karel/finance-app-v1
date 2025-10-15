import type { Config } from 'tailwindcss'
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { surface:"#121418", card:"#171a20", primary:"#5b8cff", danger:"#ef4444", muted:"#9aa4b2" },
      boxShadow: { card: "0 10px 20px rgba(0,0,0,.35)" }
    }
  },
  plugins: [],
}
export default config
