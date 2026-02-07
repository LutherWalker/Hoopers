import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  getActivePlayers,
  getPlayersWithVoteCounts,
  checkDeviceHasVoted,
  recordVote,
  getTotalVotes,
  resetAllVotes,
  createPlayer,
  deleteAllPlayers,
  getVoteCount,
} from "./db";
import { generateDeviceFingerprint, getClientIp } from "./fingerprint";
import { notifyNewVote, notifyVoteThreshold } from "./notifications";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Voting system routers
  voting: router({
    // Récupérer tous les joueurs actifs
    getPlayers: publicProcedure.query(async () => {
      const playersList = await getActivePlayers();
      return playersList;
    }),

    // Récupérer les résultats avec les votes
    getResults: publicProcedure.query(async () => {
      const results = await getPlayersWithVoteCounts();
      const totalVotes = await getTotalVotes();
      
      return {
        players: results.map(p => ({
          ...p,
          percentage: totalVotes > 0 ? Math.round((Number(p.voteCount) / totalVotes) * 100) : 0,
        })),
        totalVotes,
      };
    }),

    // Vérifier si un appareil a déjà voté
    checkIfVoted: publicProcedure
      .input(z.object({
        deviceFingerprint: z.string(),
      }))
      .query(async ({ input }) => {
        const hasVoted = await checkDeviceHasVoted(input.deviceFingerprint);
        return { hasVoted };
      }),

    // Enregistrer un vote
    vote: publicProcedure
      .input(z.object({
        playerId: z.number().int().positive(),
        deviceFingerprint: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Vérifier si l'appareil a déjà voté
          const hasVoted = await checkDeviceHasVoted(input.deviceFingerprint);
          if (hasVoted) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Vous avez déjà voté. Un seul vote par appareil est autorisé.",
            });
          }

          // Récupérer l'adresse IP et vérifier que le joueur existe
          const playersList = await getActivePlayers();
          const playerExists = playersList.some(p => p.id === input.playerId);
          
          if (!playerExists) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Le joueur n'existe pas",
            });
          }
          
          const ipAddress = getClientIp(ctx.req);
          const userAgent = ctx.req.headers["user-agent"] as string;

          // Enregistrer le vote
          await recordVote(input.playerId, input.deviceFingerprint, ipAddress, userAgent);

          // Récupérer les informations du joueur pour la notification
          const votedPlayer = playersList.find(p => p.id === input.playerId);
          
          if (votedPlayer) {
            // Compter les votes du joueur
            const playerVotes = await getPlayersWithVoteCounts();
            const playerVoteCount = playerVotes.find(p => p.id === input.playerId)?.voteCount || 0;
            
            // Envoyer notification
            await notifyNewVote(votedPlayer.name, votedPlayer.team, Number(playerVoteCount));
            
            // Vérifier les seuils (10, 25, 50, 100 votes)
            const thresholds = [10, 25, 50, 100];
            for (const threshold of thresholds) {
              if (Number(playerVoteCount) === threshold) {
                await notifyVoteThreshold(threshold, votedPlayer.name, Number(playerVoteCount));
              }
            }
          }

          return {
            success: true,
            message: "Vote enregistré avec succès !",
          };
        } catch (error) {
          if (error instanceof TRPCError) {
            throw error;
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erreur lors de l'enregistrement du vote",
          });
        }
      }),
  }),

  // Admin routers
  admin: router({
    // Réinitialiser tous les votes (admin only)
    resetVotes: protectedProcedure.mutation(async ({ ctx }) => {
      // Vérifier que l'utilisateur est admin
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès refusé. Seuls les administrateurs peuvent réinitialiser les votes.",
        });
      }

      try {
        await resetAllVotes();
        return {
          success: true,
          message: "Tous les votes ont été réinitialisés.",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de la réinitialisation des votes",
        });
      }
    }),

    // Ajouter des joueurs (admin only)
    addPlayer: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        team: z.string().min(1),
        imageUrl: z.string().optional(),
        position: z.string().optional(),
        number: z.number().int().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Accès refusé.",
          });
        }

        try {
          await createPlayer(input);
          return {
            success: true,
            message: "Joueur ajouté avec succès.",
          };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erreur lors de l'ajout du joueur",
          });
        }
      }),

    // Supprimer tous les joueurs (admin only)
    deleteAllPlayers: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Accès refusé.",
        });
      }

      try {
        await deleteAllPlayers();
        return {
          success: true,
          message: "Tous les joueurs ont été supprimés.",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erreur lors de la suppression des joueurs",
        });
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
