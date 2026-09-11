/** PIXI renderer.screen is in CSS/logical pixels; renderer.width includes DPR. */
export function fitLive2DToScreen(model, renderer, padding = .92) {
  const { width, height } = renderer.screen;
  const intrinsicWidth = model.width / model.scale.x;
  const intrinsicHeight = model.height / model.scale.y;
  if (![width, height, intrinsicWidth, intrinsicHeight, padding].every(v => Number.isFinite(v) && v > 0))
    throw new Error('Model and screen dimensions must be positive');
  const scale = Math.min(width / intrinsicWidth, height / intrinsicHeight) * padding;
  model.scale.set(scale);
  model.anchor.set(.5, .92);
  model.x = width * .5;
  model.y = height * .96;
  return { x: model.x, y: model.y, scale, width: intrinsicWidth * scale, height: intrinsicHeight * scale };
}
