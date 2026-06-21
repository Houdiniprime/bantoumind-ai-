@echo off
title BantouMind AI - Deploiement GitHub Pages
color 0B
cls

echo ╔══════════════════════════════════════════╗
echo ║   🚀 BantouMind AI - MISE EN LIGNE       ║
echo ║   Deploiement GitHub Pages automatique    ║
echo ╚══════════════════════════════════════════╝
echo.
echo 📋 Ce script va t'aider a mettre ton site en ligne gratuitement.
echo.
echo ═══════════════════════════════════════════
echo   ETAPE 1 : Cree un compte GitHub gratuit
echo ═══════════════════════════════════════════
echo.
echo   1. Va sur https://github.com
echo   2. Clique sur "Sign up"
echo   3. Suis les instructions (2 minutes)
echo   4. Confirme ton email
echo.
pause
echo.
echo ═══════════════════════════════════════════
echo   ETAPE 2 : Cree un depot (repository)
echo ═══════════════════════════════════════════
echo.
echo   1. Connecte-toi a GitHub
echo   2. Clique sur le bouton vert "New"
echo   3. Nomme le depot : bantoumind-ai
echo   4. Laisse "Public" selectionne
echo   5. Ne coche rien d'autre
echo   6. Clique "Create repository"
echo.
pause
echo.
echo ═══════════════════════════════════════════
echo   ETAPE 3 : Upload les fichiers
echo ═══════════════════════════════════════════
echo.
echo   Option A - Glisser-deposer (plus simple) :
echo   - Dans la page de ton depot GitHub
echo   - Glisse le dossier "bantoumind-ai" dans la zone grise
echo   - Attends que les fichiers se chargent
echo   - Scrolle en bas et clique "Commit changes"
echo.
echo   Option B - Ligne de commande (si tu as git) :
echo.
echo   git remote add origin https://github.com/TON_PSEUDO/bantoumind-ai.git
echo   git branch -M main
echo   git push -u origin main
echo.
pause
echo.
echo ═══════════════════════════════════════════
echo   ETAPE 4 : Active GitHub Pages
echo ═══════════════════════════════════════════
echo.
echo   1. Va dans "Settings" de ton depot
echo   2. Dans le menu de gauche, clique "Pages"
echo   3. Sous "Branch", selectionne "main"
echo   4. A cote, selectionne "/ (root)"
echo   5. Clique "Save"
echo   6. Attends 2 minutes... 
echo   7. Ton site sera en ligne a cette adresse :
echo.
echo   🌐 https://TON_PSEUDO.github.io/bantoumind-ai/
echo.
echo ═══════════════════════════════════════════
echo   ✅ TERMINE ! Ton site BantouMind AI est en ligne !
echo ═══════════════════════════════════════════
echo.
echo   Partage ce lien a tes clients pour qu'ils voient tes agents !
echo.
pause
