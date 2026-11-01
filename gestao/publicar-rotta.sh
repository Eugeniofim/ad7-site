#!/bin/sh
# Publica a DEMONSTRAÇÃO da AD7 (site + gestão) em https://rottaguide.com/ad7/ (repo público rotta-site).
#
#   sh gestao/publicar-rotta.sh "mensagem"     -> monta, copia para ~/Desktop/CODIGO/rotta-site/ad7, commit e push
#   sh gestao/publicar-rotta.sh --so-montar    -> só monta em .dist-rotta/ad7
#
# A cópia vai SEM banco (config.js do fonte, supabaseUrl vazio): os pedidos feitos no site da
# demonstração ficam no aparelho e aparecem na Caixa de entrada da gestão (mesma origem).
# O site de verdade continua em https://ad7.eugeniofim.com (publicar.sh).
set -e
cd "$(dirname "$0")/.."
ROTTA="$HOME/Desktop/CODIGO/rotta-site"
DIST=".dist-rotta/ad7"

echo "1/3 montando"
mkdir -p "$DIST"
rsync -a --delete \
  --exclude '.dist' --exclude '.dist-rotta' --exclude '.git' --exclude '.claude' --exclude 'testes' --exclude 'node_modules' --exclude '.DS_Store' \
  --exclude 'README.md' --exclude 'package.json' --exclude '.gitignore' --exclude 'publicar.sh' --exclude 'SALA-ad7.sql' \
  --exclude 'dados/tecimob-bruto.json' --exclude 'dados/importa-tecimob.py' \
  --exclude 'gestao/publicar-rotta.sh' --exclude 'gestao/README.md' --exclude 'gera-seo.py' \
  ./ "$DIST/"
grep -q "supabaseUrl: ''" "$DIST/config.js" || { echo "config.js do fonte deveria estar sem banco — parei"; exit 1; }
# na demonstração, "Equipe AD7" e "Entrar no painel" do site abrem a gestão (no site de verdade continuam pedindo a senha da conta)
python3 - "$DIST/app.js" <<'PY2'
import sys; p=sys.argv[1]; s=open(p,encoding='utf-8').read()
a='href="#/painel" style="color:var(--dourado)">Equipe AD7'; b='href="#/entrar" style="color:#C9D1D6">Entrar no painel'
assert a in s and b in s, 'links do site mudaram; ajustar publicar-rotta.sh'
s=s.replace(a,'href="gestao/" style="color:var(--dourado)">Equipe AD7').replace(b,'href="gestao/" style="color:#C9D1D6">Entrar no painel')
open(p,'w',encoding='utf-8').write(s); print('   links Equipe AD7 -> gestao/')
PY2
# a demonstração não entra no Google (o site de verdade é ad7.eugeniofim.com)
sed -i '' 's/<meta name="robots" content="index,follow">/<meta name="robots" content="noindex,nofollow">/' "$DIST/index.html"

[ "$1" = "--so-montar" ] && { echo "montado em $DIST (não publicado)"; exit 0; }

echo "2/3 copiando para $ROTTA/ad7"
[ -d "$ROTTA/.git" ] || { echo "falta o repo $ROTTA (git clone Eugeniofim/rotta-site)"; exit 1; }
rsync -a --delete "$DIST/" "$ROTTA/ad7/"

echo "3/3 publicando"
cd "$ROTTA"
git add ad7
if git diff --cached --quiet; then echo "   nada mudou desde a última publicação"; else
  git commit -q -m "${1:-AD7: demonstração do site + gestão}" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
fi
git pull -q --rebase origin main 2>/dev/null || true
git push -q origin main
echo "no ar em https://rottaguide.com/ad7/gestao/ (o GitHub leva 1 a 2 minutos) · site da demo: https://rottaguide.com/ad7/"
