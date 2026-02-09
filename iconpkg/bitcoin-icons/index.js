
import { register } from '../core.js';

const lookup = "AAABYYkY+hgyGu48rPBYGVOGNnVydFUUMlVIVkc3ZXNFRZYyhVQnXFFYNAMhfw6fAQUgS7EBA9oBBA0LAQEpAsUDAQ4aQgU7BxEkA68CDxkCBnJAAwYJpgIBEy7rAxwCWPpBdrOVezr296S8JNre7xk9Y0OnXYIDGemUy+Cs1ZKxFq3QVJ/Hjszg/JXbVq+P0RIxbGJzvXV/nFvRM00YXXXpk0n0KGkBU86Bsq3PF7elz9I0b5QP4QXlnbC7iYnIpn2L0KkXmtxiUSlIuBTNm8igpc97bel+bQ4UKiF96LOcPOzGvzXLQifItveJTcUaRGcF190nN5h019ut62FhYfR9vGsIwV+deyzIt4/7NR3gj6Z9i3Ox+COkKfFKFH771dDI88fEZ1qHyUpARv03dg24UG81z8T8U1eArXSrgnTPoZiOIbjUd4sn7gqXfPtml+XaQGW8WFez+MNcRwCBAAAAIAMAAAAAAgAAABRiaXRjb2luLWljb25zLTAxLnN2ZwAAABRiaXRjb2luLWljb25zLTAyLnN2Z/////8AAAACAAAAPwFRAAREQUAAQAQAAERAARAFAAAQAEBAAEAEQFEEQAQAAAAEEAEAQABAAQAAAEFAAEQBAQAAAEAAAEAARAFAAAAAAAA=";

const chunks = {
  "bitcoin-icons-01.svg": new URL("./bitcoin-icons-01.svg", import.meta.url).href,
  "bitcoin-icons-02.svg": new URL("./bitcoin-icons-02.svg", import.meta.url).href
};

register('bitcoin-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
