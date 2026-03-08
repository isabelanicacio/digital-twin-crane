/* Copyright (C) 2026 Eric Yugo Hioki, Alex Silveira de Campos, Eduardo de Senzi Zancul

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>. */

export function handleSensorData(
  sensorData,
  isLoaded,
  setHorizontalSensor,
  setVerticalSensor,
  setClawSensor,
  sendMessage
) {
  if (sensorData.sensor === "I2") {
    if (isLoaded) {
      setHorizontalSensor(sensorData.value);
      sendMessage(
        "Mobile parts",
        "DirectionController",
        sensorData.value ? "right" : "left"
      );
    }
  }
  if (sensorData.sensor === "I4") {
    if (isLoaded) {
      setVerticalSensor(sensorData.value);
      sendMessage(
        "Vertical",
        "DirectionController",
        sensorData.value ? "up" : "down"
      );
    }
  }
  if (sensorData.sensor === "I6") {
    if (isLoaded) {
      setClawSensor(sensorData.value);
      sendMessage(
        "Pivot 1",
        "HookController",
        sensorData.value ? "open" : "close"
      );
      sendMessage(
        "Pivot 2",
        "HookController",
        sensorData.value ? "open" : "close"
      );
    }
  }
}
