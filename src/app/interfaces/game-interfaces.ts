export interface Game {
  info?:       boolean;
  id?:         string;
  black_uid?:  string;
  white_uid:   string;
  black_user?: string;
  white_user:  string;
}

export interface GameInfo {
  game_id:          string;
  start_date;
  last_date;
  color_turn:       boolean;
  moves:            number;
  game_time:        number;
  black_time:       number;
  white_time:       number;
  black_dead_tools: string[];
  white_dead_tools: string[];
  tools_position:   object;
  threats_map:      string[];
  game_status:      string;
  chess_table:      string;
}

export interface TimeCounters {
  gameTime:  number;
  blackTime: number;
  whiteTime: number;
}

export interface PlayerInfo {
  name:  string;
  image: string;
  time:  string;
  score: number;
  deadTools: string[];
}
