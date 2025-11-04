import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'

// Plugin to create league-specific HTML files after build
function createLeagueHtmlFiles(): Plugin {
  return {
    name: 'create-league-html-files',
    closeBundle() {
      const distPath = path.resolve(__dirname, 'dist')
      const indexPath = path.join(distPath, 'index.html')

      if (fs.existsSync(indexPath)) {
        const indexHtml = fs.readFileSync(indexPath, 'utf-8')

        // Create copies for each league
        const leagues = ['dub', 'pitt', 'men']
        leagues.forEach(league => {
          const leagueHtmlPath = path.join(distPath, `${league}.html`)
          fs.writeFileSync(leagueHtmlPath, indexHtml, 'utf-8')
          console.log(`Created ${league}.html`)
        })
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), createLeagueHtmlFiles()],
  base: '/fantasy-ranker/',
})
