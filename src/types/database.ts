import type { KnockoutBracketSide, KnockoutRound, KnockoutSlotName } from "./knockout";
import type { PickType } from "./picks";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nickname: string;
          email: string;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          nickname: string;
          email: string;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: {
          nickname?: string;
          email?: string;
          is_admin?: boolean;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          name: string;
          code: string;
          group_name: string;
          flag_emoji: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          group_name: string;
          flag_emoji?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          code?: string;
          group_name?: string;
          flag_emoji?: string | null;
        };
        Relationships: [];
      };
      pick_submissions: {
        Row: {
          id: string;
          user_id: string;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          submitted_at?: string;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "pick_submissions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      picks: {
        Row: {
          id: string;
          submission_id: string;
          team_id: string;
          pick_type: PickType;
          created_at: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          team_id: string;
          pick_type: PickType;
          created_at?: string;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "picks_submission_id_fkey";
            columns: ["submission_id"];
            isOneToOne: false;
            referencedRelation: "pick_submissions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "picks_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
      team_results: {
        Row: {
          team_id: string;
          group_position: number | null;
          qualified: boolean;
          updated_at: string;
        };
        Insert: {
          team_id: string;
          group_position?: number | null;
          qualified?: boolean;
          updated_at?: string;
        };
        Update: {
          group_position?: number | null;
          qualified?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "team_results_team_id_fkey";
            columns: ["team_id"];
            isOneToOne: true;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
      pick_scores: {
        Row: {
          pick_id: string;
          user_id: string;
          is_correct: boolean;
          points: number;
          calculated_at: string;
        };
        Insert: {
          pick_id: string;
          user_id: string;
          is_correct?: boolean;
          points?: number;
          calculated_at?: string;
        };
        Update: {
          user_id?: string;
          is_correct?: boolean;
          points?: number;
          calculated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "pick_scores_pick_id_fkey";
            columns: ["pick_id"];
            isOneToOne: true;
            referencedRelation: "picks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pick_scores_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      knockout_matches: {
        Row: {
          id: string;
          code: string;
          fifa_match_number: number | null;
          round: KnockoutRound;
          bracket_side: KnockoutBracketSide;
          display_order: number;
          home_team_id: string | null;
          away_team_id: string | null;
          home_source_match_code: string | null;
          away_source_match_code: string | null;
          next_match_code: string | null;
          next_slot: KnockoutSlotName | null;
          points: number;
          starts_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          fifa_match_number?: number | null;
          round: KnockoutRound;
          bracket_side: KnockoutBracketSide;
          display_order: number;
          home_team_id?: string | null;
          away_team_id?: string | null;
          home_source_match_code?: string | null;
          away_source_match_code?: string | null;
          next_match_code?: string | null;
          next_slot?: KnockoutSlotName | null;
          points: number;
          starts_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          fifa_match_number?: number | null;
          round?: KnockoutRound;
          bracket_side?: KnockoutBracketSide;
          display_order?: number;
          home_team_id?: string | null;
          away_team_id?: string | null;
          home_source_match_code?: string | null;
          away_source_match_code?: string | null;
          next_match_code?: string | null;
          next_slot?: KnockoutSlotName | null;
          points?: number;
          starts_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      knockout_submissions: {
        Row: {
          id: string;
          user_id: string;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          submitted_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      knockout_picks: {
        Row: {
          id: string;
          submission_id: string;
          match_id: string;
          picked_team_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          submission_id: string;
          match_id: string;
          picked_team_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
      knockout_match_results: {
        Row: {
          match_id: string;
          winner_team_id: string | null;
          completed: boolean;
          updated_at: string;
        };
        Insert: {
          match_id: string;
          winner_team_id?: string | null;
          completed?: boolean;
          updated_at?: string;
        };
        Update: {
          winner_team_id?: string | null;
          completed?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      knockout_pick_scores: {
        Row: {
          pick_id: string;
          user_id: string;
          is_correct: boolean;
          points: number;
          calculated_at: string;
        };
        Insert: {
          pick_id: string;
          user_id: string;
          is_correct?: boolean;
          points?: number;
          calculated_at?: string;
        };
        Update: {
          user_id?: string;
          is_correct?: boolean;
          points?: number;
          calculated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      ranking_scores: {
        Row: {
          user_id: string;
          nickname: string;
          submitted_at: string;
          total_points: number;
          correct_picks: number;
          scored_picks: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      recalculate_pick_scores: {
        Args: Record<PropertyKey, never>;
        Returns: {
          total_picks_scored: number;
          total_correct: number;
          total_points: number;
          recalculated_at: string;
        }[];
      };
      submit_user_picks: {
        Args: {
          submitted_picks: Json;
          locked_at: string;
          profile_id: string;
        };
        Returns: string;
      };
      submit_knockout_picks: {
        Args: {
          submitted_picks: Json;
          locked_at: string;
          profile_id: string;
        };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
