import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, players, votes, deviceFingerprints } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Voting system queries
export async function getActivePlayers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(players).where(eq(players.isActive, 1));
}

export async function getVoteCount(playerId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`COUNT(*)` }).from(votes).where(eq(votes.playerId, playerId));
  return result[0]?.count || 0;
}

export async function getTotalVotes() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`COUNT(*)` }).from(votes);
  return result[0]?.count || 0;
}

export async function getVotesByPlayer(playerId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(votes).where(eq(votes.playerId, playerId));
}

export async function checkDeviceHasVoted(fingerprint: string) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(deviceFingerprints).where(eq(deviceFingerprints.fingerprint, fingerprint)).limit(1);
  return result.length > 0 && result[0].hasVoted === 1;
}

export async function recordVote(playerId: number, deviceFingerprint: string, ipAddress?: string, userAgent?: string) {
  const db = await getDb();
  if (!db) return null;
  
  // Record the vote
  await db.insert(votes).values({
    playerId,
    deviceFingerprint,
    ipAddress,
    userAgent,
  });
  
  // Update device fingerprint
  await db.insert(deviceFingerprints).values({
    fingerprint: deviceFingerprint,
    hasVoted: 1,
    lastVoteAt: new Date(),
  }).onDuplicateKeyUpdate({
    set: {
      hasVoted: 1,
      lastVoteAt: new Date(),
    },
  });
}

export async function resetAllVotes() {
  const db = await getDb();
  if (!db) return;
  await db.delete(votes);
  await db.delete(deviceFingerprints);
}

export async function getPlayersWithVoteCounts() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: players.id,
    name: players.name,
    team: players.team,
    imageUrl: players.imageUrl,
    position: players.position,
    number: players.number,
    isActive: players.isActive,
    createdAt: players.createdAt,
    updatedAt: players.updatedAt,
    voteCount: sql<number>`COUNT(${votes.id})`,
  }).from(players).leftJoin(votes, eq(players.id, votes.playerId)).where(eq(players.isActive, 1)).groupBy(players.id).orderBy(sql`COUNT(${votes.id}) DESC`);
}

export async function createPlayer(data: { name: string; team: string; imageUrl?: string; position?: string; number?: number }) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(players).values(data);
  return result;
}

export async function deleteAllPlayers() {
  const db = await getDb();
  if (!db) return;
  await db.delete(players);
}
