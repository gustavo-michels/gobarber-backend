class CustomException extends Error {
  constructor(message) {
    super(message);

    this.name = this.constructor.name;
    this.status = 401;
  }
}

module.exports = CustomException;
