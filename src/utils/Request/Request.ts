/**
 * Abort request
 * @param {AbortController} controller Controller
 * @param {boolean} create Create new controller
 * @returns {AbortController}
 */
export function abortRequest(
  controller: AbortController,
  create?: boolean
): AbortController {
  try {
    if (controller) {
      controller.abort();
    }

    if (create) {
      return new AbortController();
    }
  } catch (error) {
    if (error.code !== "ERR_CANCELED") {
      throw error;
    }
  }
}
