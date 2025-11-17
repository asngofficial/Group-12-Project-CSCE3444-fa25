// storageMigration.ts

import {
    getAllUsers,
    saveUsers,
    getAllChallenges,
    saveChallenges,
    getAllPuzzles,
    savePuzzles,
    getAllRooms,
    saveRooms,
    getAllNotifications,
    saveNotifications,
  } from "./accountManager"; // adjust this to your actual import paths
  import { ACHIEVEMENTS } from "./achievements";
  
  const STORAGE_VERSION_KEY = "sudoku_storage_schema_version";
  const CURRENT_SCHEMA_VERSION = 2;
  
  const migrations: Record<number, () => void> = {
    2: () => {
      // 1) Migrate users → add achievements array
      const users = getAllUsers();
      let usersChanged = false;
      const migratedUsers = users.map(u => {
        if (!("achievements" in u) || !Array.isArray(u.achievements)) {
          usersChanged = true;
          return { ...u, achievements: [] };
        }
        return u;
      });
      if (usersChanged) {
        saveUsers(migratedUsers);
        console.log("[Migration] Added achievements to users");
      }
  
      // 2) Example: Migrate rooms if a new `status` field was added
      const rooms = getAllRooms();
      let roomsChanged = false;
      const migratedRooms = rooms.map(r => {
        if (!(r as any).status) {
          roomsChanged = true;
          return { ...r, status: "waiting" as any };
        }
        return r;
      });
      if (roomsChanged) {
        saveRooms(migratedRooms);
        console.log("[Migration] Added status to rooms");
      }
  
      // 3) Puzzles: initialize `likes` if missing
      const puzzles = getAllPuzzles();
      let puzzlesChanged = false;
      const migratedPuzzles = puzzles.map(p => {
        if (!Array.isArray((p as any).likes)) {
          puzzlesChanged = true;
          return { ...p, likes: [] };
        }
        return p;
      });
      if (puzzlesChanged) {
        savePuzzles(migratedPuzzles);
        console.log("[Migration] Initialized likes on puzzles");
      }
  
      // 4) Challenges: initialize `status` if missing
      const challenges = getAllChallenges();
      let challengesChanged = false;
      const migratedChallenges = challenges.map(c => {
        if (!(c as any).status) {
          challengesChanged = true;
          return { ...c, status: "pending" as any };
        }
        return c;
      });
      if (challengesChanged) {
        saveChallenges(migratedChallenges);
        console.log("[Migration] Initialized status on challenges");
      }
  
      // 5) Notifications: initialize `read` flag if missing
      const notifications = getAllNotifications();
      let notificationsChanged = false;
      const migratedNotifications = notifications.map(n => {
        if (!("read" in n)) {
          notificationsChanged = true;
          return { ...n, read: false };
        }
        return n;
      });
      if (notificationsChanged) {
        saveNotifications(migratedNotifications);
        console.log("[Migration] Added read flag on notifications");
      }
    },
  
    // Future migrations go here (e.g., version 3 → version 4, etc.)
  };
  
  export function runStorageMigrationsIfNeeded() {
    const versionString = localStorage.getItem(STORAGE_VERSION_KEY);
    const storedVersion = versionString ? parseInt(versionString, 10) : 0;
  
    if (storedVersion < CURRENT_SCHEMA_VERSION) {
      console.log(`[Migration] Running migrations from v${storedVersion} → v${CURRENT_SCHEMA_VERSION}`);
      for (let v = storedVersion + 1; v <= CURRENT_SCHEMA_VERSION; v++) {
        const migrateFn = migrations[v];
        if (migrateFn) {
          try {
            migrateFn();
          } catch (err) {
            console.error(`[Migration] Error migrating to version ${v}`, err);
          }
        }
      }
      localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_SCHEMA_VERSION));
      console.log("[Migration] Complete");
    } else {
      console.log("[Migration] No migration needed");
    }
  }
  