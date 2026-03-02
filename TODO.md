# Project TODO List: Travel Guide App

**Current Status (Inferred):**
- [x] **Project Setup**: MERN Stack initialized (Vite, Express, MongoDB).
- [x] **Authentication**: Login/Signup routes and UI implemented (`authRoute`, `Login.jsx`).
- [/] **Basic UI**: Landing Page and HomePage skeletons exist.

## Phase 1: Core Content Management (High Priority)
*Without these, the app has no "Travel Guide" content.*

- [ ] **Database Schemas**:
    - [ ] Create `Destination` model (Name, Description, Location, ImageURL, Rating).
    - [ ] Create `Category` model (optional, e.g., Beaches, Mountains).
- [ ] **Backend API**:
    - [ ] `GET /destinations`: Fetch all destinations (with pagination?).
    - [ ] `GET /destinations/:id`: Fetch single destination details.
    - [ ] `POST /destinations`: Admin create destination (or seed script).
- [ ] **Frontend Integration**:
    - [ ] Create `DestinationCard` component.
    - [ ] Create `DestinationList` component (Grid view).
    - [ ] Create `DestinationDetail` page (at `/destination/:id`).

## Phase 2: User Engagement
- [ ] **Search & Filter**:
    - [ ] Implement search bar on Home Page.
    - [ ] Backend filter logic (`find({ name: /regex/ })`).
- [ ] **User Profile**:
    - [ ] `GET /user/profile`: Fetch user details.
    - [ ] Edit Profile page.

## Phase 3: Advanced Features (To be confirmed)
- [ ] **Reviews/Ratings**: Allow users to comment on destinations.
- [ ] **Favorites/Wishlist**: Save destinations.
- [ ] **Itinerary Planner**: simple drag-and-drop or list builder.

## Maintenance & Tech Debt
- [ ] **Environment Variables**: Ensure `.env` is properly configured for all devs.
- [ ] **Error Handling**: Standardize API error responses.
- [ ] **Responsiveness**: Check UI on mobile/tablet.
