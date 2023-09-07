class MusicError extends Error {
  constructor(message: string) {
    super(message);
  }
}

class PlayerNotPlaying extends MusicError {
  constructor() {
    super("Player is not playing");
  }
}

class EmptyQueue extends MusicError {
  constructor() {
    super("Queue is empty");
  }
}
