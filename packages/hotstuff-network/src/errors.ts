export class HotStuffError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
  }
}

export class TimeStepValidationError extends HotStuffError {}

export class TotalTimeValidationError extends HotStuffError {}

export class NodeIdValidationError extends HotStuffError {}

export class NodeNotFoundError extends HotStuffError {}

export class TemperatureValidationError extends HotStuffError {}

export class ThermalCapacitanceValidationError extends HotStuffError {}

export class ThermalResistanceValidationError extends HotStuffError {}

export class CircularConnectionError extends HotStuffError {}
