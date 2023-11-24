# Install nvm
# set root user to run script
NODE_VERSION=18.11.0
curl https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
nvm -v
nvm install $NODE_VERSION
nvm alias default $NODE_VERSION
nvm use default

# config git
git config --global user.name 'Nguyen Duy Minh'
git config --global user.email 'minhnguyenduy99@gmail.com'

# install package
npm install