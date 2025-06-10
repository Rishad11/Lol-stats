/**
 * Wrapper function for async route handlers in Express
 * Automatically catches any errors thrown in async functions and passes them to the error handler
 *
 * @param {Function} fn 
 * @returns {Function} 
 */
const wrapAsync = (fn) => {
  return (req, res, next) => {
    // Execute the async function and catch any errors
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

module.exports = wrapAsync
