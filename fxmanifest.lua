fx_version 'cerulean'
game 'gta5'

author 'JarssS8'
description 'A treasure hunt minigame'
version '1.0.0'

-- Scripts
shared_script 'shared.lua'
client_script 'client.lua'
server_script 'server.lua'

-- NUI Files
ui_page 'web/index.html'

files {
    'web/index.html',
    'web/script.js'
}