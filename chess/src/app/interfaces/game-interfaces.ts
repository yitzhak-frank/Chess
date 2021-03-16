export interface Game {
  id?:         string;
  black_uid?:  string;
  white_uid:   string;
  black_user?: string;
  white_user:  string;
}

export interface GameInfo {
  game_id:          string;
  start_date:       number;
  last_date:        number;
  color_turn:       boolean;
  moves:            number;
  game_time:        number;
  black_time:       number;
  white_time:       number;
  black_attacks:    number;
  white_attacks:    number;
  black_dead_tools: string;
  white_dead_tools: string;
  tools_position:   object;
  threts_map:       string[];
}

export interface Connection {
  game_id?:    string,
  black_player: number,
  white_player: number
}
