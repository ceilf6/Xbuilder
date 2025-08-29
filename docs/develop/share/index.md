## MobileKeyboard APls

The HTTP APIs provided by spx-backend for mobileKeyboard management. provide to Edit and View

See details in [`MobileKeyboard APIs`](./module_MobileKeyboardAPIs.ts).

## MobileKeyboard Edit

Used for editing mobile keyboard layouts. It provides common key pools and fixed editing zones, allowing users to drag the corresponding keys to the desired areas.
See details in [`MobileKeyboard Edit`](./module_MobileKeyboardEdit.ts).

## MobileKeyboard View

Used for displaying the mobile keyboard layout. It shows the assigned keys in their respective zones and reflects the current keyboard state.
See details in [`MobileKeyboard View`](./module_MobileKeyboardView.ts).

## UIKeyBtn

Core key component in keyboard, responsible for individual key display and interaction logic. Serves both Edit and View components, and interacts with game canvas through `projectRunner` to implement key mapping functionality.

See details in [`UIKeyBtn`](./module_UIKeyBtn.ts).

## Module Relationships

The following diagram illustrates the relationships between the different modules in the mobile keyboard system:

```mermaid
graph TB
    %% Core Components
    UIKeyBtn["`**UIKeyBtn**
    Core key component
    • Individual key display
    • User interaction logic
    • Serves Edit & View`"]

    %% View & Edit Modules
    MobileKeyboardView["`**MobileKeyboard View**
    Keyboard display & interaction
    • Show assigned keys
    • Handle user input
    • Reflect keyboard state`"]

    MobileKeyboardEdit["`**MobileKeyboard Edit**
    Keyboard layout editor
    • Key pool management
    • Drag & drop zones
    • Layout configuration`"]

    %% API Module
    MobileKeyboardApis["`**MobileKeyboard APIs**
    HTTP APIs for management
    • Save/Load configs
    • Project settings`"]

    %% Game Integration
    ProjectRunner["`**ProjectRunner**
    Game execution bridge
    • Manages game iframe
    • Keyboard event dispatching
    • Canvas interaction`"]

    %% Game Canvas
    GameCanvas["`**Game Canvas**
    Game rendering & input
    • Receives keyboard events
    • Game input processing`"]

    %% Relationships
    MobileKeyboardView --> UIKeyBtn
    MobileKeyboardEdit --> UIKeyBtn

    MobileKeyboardView --> ProjectRunner
    UIKeyBtn --> ProjectRunner
    ProjectRunner --> GameCanvas

    MobileKeyboardApis --> MobileKeyboardView
    MobileKeyboardApis --> MobileKeyboardEdit
    MobileKeyboardEdit --> MobileKeyboardApis

    %% Styling
    classDef coreComponent fill:#fff3e0,stroke:#ef6c00,stroke-width:3px
    classDef viewModule fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef editModule fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef apiModule fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef gameModule fill:#fce4ec,stroke:#c2185b,stroke-width:2px

    class UIKeyBtn coreComponent
    class MobileKeyboardView viewModule
    class MobileKeyboardEdit editModule
    class MobileKeyboardApis apiModule
    class ProjectRunner,GameCanvas gameModule
```
