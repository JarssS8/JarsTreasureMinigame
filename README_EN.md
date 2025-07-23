# 🏴‍☠️ Jars Treasure Minigame

A treasure hunt minigame for FiveM developed by JarssS8. Players must find a hidden cell in a grid before time runs out or attempts are exhausted.

## 🎥 Video Demo

[![Video Demo](https://img.shields.io/badge/🎬-Watch%20Demo-red?style=for-the-badge)](https://youtu.be/kaVq1YsJrPo)

> Click the link to see the minigame in action with all its features and game modes.

## 📋 Features

- **Multiple hint modes**: Numbers, icons or no hints
- **Visual modes**: With colors or without colors
- **Customizable grid**
- **Limited attempts system**
- **Configurable timer**
- **QB-Core integration**
- **Responsive web interface**
- **Complete debug system**

## 🚀 Installation

1. Download the resource and place it in your resources folder
2. Add `ensure jars-minigames` to your `server.cfg`
3. Restart the server or execute `refresh` and `start jars-minigames`

## ⚙️ Configuration

### `shared.lua` File

```lua
JTM.Config = {
    Debug = false,          -- Enable/disable debug mode
    HintMode = "number",    -- Hint mode: "number", "icons", "none"
    VisualMode = "color",   -- Visual mode: "color", "nocolor"
    GridSize = 5,           -- Grid size (3-10)
    Attempts = 8,           -- Number of allowed attempts
    Time = 10,              -- Time limit in seconds
    -- Version check configuration
    CheckVersion = true,    -- Check for updates on startup
    GitHubRepo = "JarssS8/JarsTreasureMinigame"
}
```

### Configuration Parameters

| Parameter | Type | Values | Description |
|-----------|------|---------|-------------|
| `Debug` | boolean | `true/false` | Enables debug messages and test command |
| `HintMode` | string | `"number"`, `"icons"`, `"none"` | Type of hints displayed |
| `VisualMode` | string | `"color"`, `"nocolor"` | Whether to show colors in cells |
| `GridSize` | number | `3-10` | Grid size (NxN) |
| `Attempts` | number | `1-99` | Maximum number of attempts |
| `Time` | number | `5-300` | Time limit in seconds |
| `CheckVersion` | boolean | `true/false` | Automatically check for updates |
| `GitHubRepo` | string | `"owner/repo"` | GitHub repository for version checking |

## 🎮 Usage

### For Developers

```lua
-- Start the minigame programmatically
JTM.StartTreasureMinigame(hintMode, visualMode, gridSize, attempts, time)

-- Example
JTM.StartTreasureMinigame("number", "color", 5, 8, 15)
```

### Debug Command

When `Debug = true` in configuration:

```
/treasure-minigame [hintMode] [visualMode] [gridSize] [attempts] [time]
```

**Examples:**
```bash
/treasure-minigame                          # Uses default values
/treasure-minigame number color 5 8 10      # Custom configuration
/treasure-minigame icons nocolor 7 12 20    # With icons and no colors
/treasure-minigame none color 3 5 30        # No hints, small grid
```

## 🔄 Update System

The script includes an automatic version checking system that:

- **Gets current version** automatically from the local `fxmanifest.lua`
- **Checks for updates** when the resource starts (server-side only)
- **Compares versions** with the official GitHub repository
- **Shows warnings** only when updates are available
- **Provides direct** download links

### Version Check Configuration

```lua
CheckVersion = true,    -- Enable/disable automatic checking
GitHubRepo = "JarssS8/JarsTreasureMinigame"  -- Official repository
```

> **Note**: The current version is automatically obtained from `fxmanifest.lua`, no manual configuration needed.

## 🎯 Game Mechanics

### Hint Modes

- **`"number"`**: Shows numbers indicating proximity to treasure
- **`"icons"`**: Uses Font Awesome icons for hints
- **`"none"`**: No hints, random search only

### Visual Modes

- **`"color"`**: Cells change color based on proximity
- **`"nocolor"`**: No visual color indicators

### Proximity System

The game calculates distance from each clicked cell to the treasure:
- **Green/😀**: Very close (distance ≤ 1)
- **Yellow/😊**: Close (distance ≤ 2)
- **Orange/😐**: Medium (distance ≤ 3)
- **Red/😞**: Far (distance > 3)

### Win/Loss Conditions

**Victory**: Find the treasure cell
**Defeat**: 
- Time runs out
- Attempts are exhausted
- Player closes the minigame (ESC)

## 🔧 Events and Callbacks

### Server Events

```lua
-- Triggered when player completes the minigame
RegisterNetEvent('treasure:gameResult')
AddEventHandler('treasure:gameResult', function(hasWon)
    local src = source
    local playerName = GetPlayerName(src)
    -- Add reward logic here
end)
```

### NUI Callbacks

```lua
-- Game result
RegisterNuiCallback('gameResult', function(data, cb)
    -- data.win contains true/false
    cb('ok')
end)

-- UI closure
RegisterNuiCallback('closeUI', function(data, cb)
    cb('ok')
end)
```

## 🎨 Customization

### Modify Styles

Edit `web/index.html` to change:
- Interface colors
- Cell sizes
- Fonts and effects
- Font Awesome icons

### Add New Modes

1. Modify `web/script.js` for new hint types
2. Update logic in `setupGame()` and `handleCellClick()`
3. Add new CSS styles if necessary

## 🐛 Debug and Troubleshooting

### Enable Debug

```lua
JTM.Config.Debug = true
```

This will enable:
- Debug messages in console
- `/treasure-minigame` command
- Detailed event logs

### Common Issues

| Problem | Solution |
|---------|----------|
| Interface doesn't appear | Verify NUI is working and resources are loaded |
| Notifications don't work | Confirm QB-Core is installed |
| Command doesn't work | Enable `Debug = true` in configuration |
| JavaScript errors | Check F12 browser console |

### Debug Logs

Debug messages follow this format:
```
^3[DEBUG] [CLIENT] Client message^7
^3[DEBUG] [SERVER] Server message^7
```

## 📁 File Structure

```
jars-minigames/
├── fxmanifest.lua          # Resource manifest
├── client.lua              # Client logic
├── server.lua              # Server logic
├── shared.lua              # Shared configuration
├── README.md               # Spanish documentation
└── web/
    ├── index.html          # Minigame interface
    └── script.js           # Frontend logic
```

## 🔄 Integration with Other Scripts

### Example Usage in a Robbery Script

```lua
-- In your robbery script
local function startTreasureHack()
    local success = false
    
    -- Register temporary event for result
    RegisterNetEvent('myrobbery:treasureResult')
    AddEventHandler('myrobbery:treasureResult', function(won)
        success = won
    end)
    
    -- Start minigame
    JTM.StartTreasureMinigame("number", "color", 4, 6, 20)
    
    -- Wait for result (implement your own waiting logic)
    return success
end
```

### With Different Frameworks

If you don't use QB-Core, modify the `Notify` function in `shared.lua`:

```lua
Notify = function(text, type)
    -- For ESX
    TriggerEvent('esx:showNotification', text)
    
    -- For other frameworks
    -- TriggerEvent('yourframework:notify', text, type)
end
```

## 📝 License

Developed by **JarssS8** https://github.com/JarssS8. 
Free to use without changing the script name

## 🤝 Contributions

If you find bugs or want to suggest improvements:
1. Report issues in detail
2. Include steps to reproduce problems
3. Provide debug logs when possible

## 📞 Support

For technical support, make sure to include:
- FiveM version
- Configuration used
- Complete error logs
- Steps to reproduce the issue

---

**Version**: 1.0.0  
**Author**: JarssS8  
**Compatibility**: FiveM
