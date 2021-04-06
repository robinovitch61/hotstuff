export class TimeStepValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeStepValidationError';
  }
}

export class TotalTimeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TotalTimeValidationError';
  }
}

export class NodeIdValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NodeIdValidationError';
  }
}

export class NodeNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NodeNotFoundError';
  }
}

export class TemperatureValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TemperatureValidationError';
  }
}

export class ThermalCapacitanceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ThermalCapacitanceValidationError';
  }
}

export class ThermalResistanceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ThermalResistanceValidationError';
  }
}

export class CircularConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircularConnectionError';
  }
}
