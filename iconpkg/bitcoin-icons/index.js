
import { register } from '../core.js';

const lookup = "AAABY4kY+hgyGiyUz3FYGURzVWZ1hDNUNEIUdmU2ZTZ5EwRIl6Q0WGhYNggGMyMpKCoq5AEPigQHARERBgEBCheQAc8BCx0hBDQFCIEHNwQVCwc2jQMI/AojApwFAY4DQAJY+lrExioN24HQr2LUsfQDXZp0U5/HiSE9qchKiaWzv6acV51384t+18i3ra1Dkn2bPDWXi1t0TUAU1ce4Z+DlI6xma9fsCI5vVFOP0HwzN63EbO5pJEZEDieOSvjgErzVdMkXCve9e8PLiaShbRliuGF7pbP8sjTpdSe4F1/xUKek/E1YGqCUvDqzb3/cBYIW4IKXUc/PLPuY6Hbaj+kBldrMzsv4Ka0dV2FJfocpBSjhXLZ9NdFWfaudgMjIFPum98XrNxnl0A/0YXNlzdsndbBzjxT7vItC3nsYNZRAXZz9le8hz8/Rsc9t9mfIQWO3mMFI3ZO7fTF20ulHBAAgCCgAAAAAAAACAAAAFGJpdGNvaW4taWNvbnMtMDEuc3ZnAAAAFGJpdGNvaW4taWNvbnMtMDIuc3Zn/////wAAAAIAAAA/RABAEBAAAEBAAEAAQEAARAEEAAABVBQAQAAFAARAUAAAAUAEAAEAQQAABAQAQABAAAFFABAAAQAEAFQBQQAAAAAAAA==";

const chunks = {
  "bitcoin-icons-01.svg": new URL("./bitcoin-icons-01.svg", import.meta.url).href,
  "bitcoin-icons-02.svg": new URL("./bitcoin-icons-02.svg", import.meta.url).href
};

register('bitcoin-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
