# Project TODO List: Travel Guide App

**Current Status (Inferred):**
- [x] **Project Setup**: MERN Stack initialized (Vite, Express, MongoDB).
- [x] **Authentication**: Login/Signup routes and UI implemented (`authRoute`, `Login.jsx`).
- [x] **Basic UI**: Landing Page and HomePage skeletons exist.

## Phase 1: Core Content Management (High Priority)
*Without these, the app has no "Travel Guide" content.*

- [x] **Database Schemas**:
    - [x] Create `Destination` model (Name, Description, Location, ImageURL, Rating).
    - [x] Create `Category` model (optional, e.g., Beaches, Mountains).
- [x] **Backend API**:
    - [x] `GET /destinations`: Fetch all destinations (with pagination?).
    - [x] `GET /destinations/:id`: Fetch single destination details.
    - [x] `POST /destinations`: Admin create destination (or seed script).
- [x] **Frontend Integration**:
    - [x] Create `DestinationCard` component.
    - [x] Create `DestinationList` component (Grid view).
    - [x] Create `DestinationDetail` page (at `/destination/:id`).

## Phase 2: User Engagement
- [x] **Search & Filter**:
    - [x] Implement search bar on Home Page.
    - [x] Backend filter logic (`find({ name: /regex/ })`).
- [x] **User Profile**:
    - [x] `GET /user/profile`: Fetch user details.
    - [x] Edit Profile page.

## Phase 3: Advanced Features (To be confirmed)
- [x] **Reviews/Ratings**: Allow users to comment on destinations.
- [x] **Favorites/Wishlist**: Save destinations.
- [ ] **Itinerary Planner**: simple drag-and-drop or list builder.

## Maintenance & Tech Debt
- [ ] **Environment Variables**: Ensure `.env` is properly configured for all devs.
- [ ] **Error Handling**: Standardize API error responses.
- [ ] **Responsiveness**: Check UI on mobile/tablet.
