
import { register } from '../core.js';

const lookup = "AAABpIkZASoYPBojDvslWB5VREk1XCJiRXU2eWQjM2ZnQXQyeDVURHdoQ1UlRZdYPxoODRvLCg1NAaDhAgUBCggUReYBywEKAgYDAXQW3QE/Bx/VAQEC2wUIDwQEDwjbAR7uAi4BI04IAgYDDASyGgJZASpmwOmLbIkeQRTzi6DOsp5rAV7C5DUsu3lgx8nKURxsEDqtYxg66N++xulYvaI70uQRF6UNEYadnZ9AcV+VfqmDKqGCxVUlWlOtjAigzUGCf4EcKmP8q5ldvmAqC4h6AYaPuI/oG9eA/u6a8Jc8PPEx8tfcXM0k8jl9p7YDn1PpyUGlg6NYES4gB5dbhx5wuBWdTYEzjWd55dXLBepIzInIfxnGckQEby0JrCNQ4yRRFGOTJvDvThsRkbZIcThk3IHz12D2DpgRexZxm5HZh6MwVXvTtpZ7lR7neNlqQkvLVJ1+17dWOJHC+1zzjuaLVkPsDfVtju92pPd4K7/3m3OHvRW5vf3/m7k+SqNQb8seQi8HlfYR5n/vB53Xfazza1i9aTWsYQ9ZhPhHSAAeSAABAgAAAAAAAAIAAAAKdWltLTAxLnN2ZwAAAAp1aW0tMDIuc3Zn/////wAAAAIAAABLFRQQABBAAQQUEVQBRAABFFQABQFARERFQFQARREQARABABFBBAUBAQQQEFAAAQQAABAVFABEBAAEUEEABEBEEAAAQREAQRQBAVEAAAAAAA==";

const chunks = {
  "uim-01.svg": new URL("./uim-01.svg", import.meta.url).href,
  "uim-02.svg": new URL("./uim-02.svg", import.meta.url).href
};

register('uim', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
