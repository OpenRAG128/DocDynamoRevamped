# DocDynamo Revamped

DocDynamo is a modern, React-based document chat application that enables users to interact with their documents through specialized AI personas (e.g., Student, Researcher). It features a sleek dual-pane interface providing seamless document preview and AI chat capabilities.

## 🚀 Features

- **Upload & Chat**: Upload documents (PDF, images, etc.) and instantly create chat sessions.
- **Role-Based Personas**: Contextual AI interactions with specialized personas:
  - 🎓 Student
  - 🔬 Researcher
  - 💼 Professional
- **Dual-Pane Interface**: Split-view showing both the document preview and the chat session side-by-side.
- **Local Persistence**:
  - File contents are stored locally using **IndexedDB**.
  - Chat metadata and history are persisted in **localStorage**.
- **Dark Mode**: Fully supported theming with dark/light variants and glossy "glass-morphism" effects.
- **PDF & Image Support**: Integrated real-time document rendering.

## 🏗️ Architecture & Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Animations**: [Motion](https://motion.dev/) & tw-animate-css
- **Icons**: [Lucide React](https://lucide.dev/) & React Icons
- **Document Rendering**: React-PDF (pdfjs-dist)
- **Database (Client-side)**: Firebase (for auth/remote DB, if configured) + Local IndexedDB for offline files.

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components (Sidebar, ChatPage, etc.)
├── util/                # Utilities (IndexedDB wrappers, API calls, classes)
│   ├── api.js           # External API integrations
│   ├── firebase.js      # Firebase configuration & initialization
│   ├── personas.jsx     # Persona/Role definitions
│   └── utils.js         # Common helpers (e.g. `cn` for Tailwind, DB ops)
├── App.jsx              # Main router and theme provider setup
├── index.css            # Global styles and Tailwind custom properties
└── main.jsx             # React entry point
```

## 💾 Data Flow & Storage

1. **Upload**: Users upload a file via `MainSection.jsx` and select a persona/role.
2. **Setup**: The app generates a unique `chatId` (UUID).
3. **File Storage**: The actual file Blob is saved to **IndexedDB** (`DocDynamoDB`, `files` store).
4. **Metadata Storage**: Chat details (title, timestamps, active role) are stored in **localStorage** under the `docDynamoChats` key.
5. **Navigation**: The user is routed to `/chat/:chatId` where `ChatPage.jsx` fetches the data and opens the dual-pane view.

## ⚙️ Development & Scripts

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

Clone the repository and install dependencies:

```bash
npm install
```

### Available Scripts

- `npm run dev` - Start the Vite development server with Hot Module Replacement (HMR).
- `npm run build` - Compile and build the project for production.
- `npm run preview` - Preview the built production application locally.
- `npm run lint` - Run ESLint checks across the codebase.

## 🎨 Styling & Theming Conventions

- **CSS Variables**: Core theme colors and backgrounds are defined in `src/index.css` as custom properties.
- **Tailwind v4**: Handled through `@tailwindcss/vite`.
- **Glass Effects**: Reusable `backdrop-blur-xl` classes are used for overlay elements to give a frosted glass aesthetic (found in `glassBase` patterns).

## 📄 Handling Documents (PDF integration)

PDF management is implemented using `pdfjs-dist` and `react-pdf`.

- Previews are embedded using an `iframe` with all default browser toolbars disabled.
- Custom zoom controls and panning are achieved through CSS transforms.
- Non-standard file types lacking previews gracefully fallback to a standard "No preview available" state.
