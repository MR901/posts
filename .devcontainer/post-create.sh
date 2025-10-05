#!/usr/bin/env bash

if [ -f package.json ]; then
  bash -i -c "nvm install --lts && nvm install-latest-npm"
  npm i
  npm run build
fi

# Install dependencies for shfmt extension
curl -sS https://webi.sh/shfmt | sh &>/dev/null

# Add OMZ plugins
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting
git clone https://github.com/zsh-users/zsh-autosuggestions ~/.oh-my-zsh/custom/plugins/zsh-autosuggestions
sed -i -E "s/^(plugins=\()(git)(\))/\1\2 zsh-syntax-highlighting zsh-autosuggestions\3/" ~/.zshrc

# Avoid git log use less
echo -e "\nunset LESS" >>~/.zshrc

# Ensure scripts are executable
chmod +x ./scripts/*.sh 2>/dev/null || true

# Ensure 'python' resolves to Python 3 for RST converter
if ! command -v python >/dev/null 2>&1 && command -v python3 >/dev/null 2>&1; then
  sudo ln -s "$(command -v python3)" /usr/local/bin/python || true
fi

# Python packages required by RST converter
if command -v python3 >/dev/null 2>&1; then
  python3 -m pip install --upgrade pip >/dev/null 2>&1 || true
  python3 -m pip install --no-cache-dir docutils pygments PyYAML >/dev/null 2>&1 || true
fi

# Fallback: install Python tooling via APT if pip is missing
if ! command -v pip3 >/dev/null 2>&1; then
  sudo apt-get update -y >/dev/null 2>&1 || true
  sudo apt-get install -y python3-pip python3-docutils python3-pygments python3-yaml >/dev/null 2>&1 || true
fi
