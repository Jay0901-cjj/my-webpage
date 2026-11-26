// 1. 取得 DOM 元素
const form = document.getElementById("payment-form");
const cardInput = document.getElementById("card-number");
const expiryInput = document.getElementById("expiry");
const cvvInput = document.getElementById("cvv");
const amountInput = document.getElementById("amount");
const result = document.getElementById("result");

// 2. 共用工具函式
function isEmpty(value) {
  return value.trim() === "";
}

function containsDigitsOnly(value) {
  return /^\d+$/.test(value);
}

function hasLength(value, length) {
  return value.length === length;
}

// 顯示與清除錯誤訊息（對應簡報第 11 頁）
function showFieldError(input, text) {
  const field = input.closest(".field");
  const error = field.querySelector(".error");
  field.classList.add("invalid");
  error.textContent = text;
}

function clearErrors() {
  document.querySelectorAll(".field").forEach(function (field) {
    field.classList.remove("invalid");
    field.querySelector(".error").textContent = "";
  });
  result.textContent = "";
  result.className = "";
}

// 3. Luhn 檢查碼演算法（對應簡報第 15-16 頁）
function passesLuhn(cardNumber) {
  const digits = cardNumber.replace(/\s/g, "");
  let sum = 0;
  let shouldDouble = false;

  // 從最右邊（最後一位）往左處理
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);

    if (shouldDouble) {
      digit = digit * 2;
      if (digit > 9) {
        digit = digit - 9;
      }
    }

    sum = sum + digit;
    shouldDouble = !shouldDouble; // 每處理一位就切換是否加倍
  }

  // 總和可以被 10 整除代表檢查通過
  return sum % 10 === 0;
}

// 4. 各欄位獨立驗證函式

// 驗證卡號：空白 -> 純數字 -> 16位長度 -> Luhn 檢查碼
function validateCardNumber() {
  const rawValue = cardInput.value;

  if (isEmpty(rawValue)) {
    showFieldError(cardInput, "請輸入測試卡號");
    return false;
  }

  // 移除所有空白字元
  const digits = rawValue.trim().replace(/\s/g, "");

  if (!containsDigitsOnly(digits)) {
    showFieldError(cardInput, "卡號只能包含數字與空白");
    return false;
  }

  if (!hasLength(digits, 16)) {
    showFieldError(cardInput, "測試卡號必須是 16 位數");
    return false;
  }

  if (!passesLuhn(digits)) {
    showFieldError(cardInput, "卡號檢查碼錯誤，請確認是否輸入有誤");
    return false;
  }

  return true;
}

// 驗證有效期限：空白 -> MM/YY 格式與月份(01-12) -> 年份(>=26)
function validateExpiry() {
  const value = expiryInput.value.trim();

  if (isEmpty(value)) {
    showFieldError(expiryInput, "請輸入有效期限");
    return false;
  }

  const match = value.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!match) {
    showFieldError(expiryInput, "格式需為 MM/YY，且月份必須介於 01 到 12");
    return false;
  }

  const month = Number(match[1]);
  const year = Number(match[2]);

  if (month < 1 || month > 12 || year < 26) {
    showFieldError(expiryInput, "有效期限已過期或年份不正確（需 26 年以上）");
    return false;
  }

  return true;
}

// 驗證安全碼：空白 -> 剛好 3 位數字
function validateCvv() {
  const value = cvvInput.value.trim();

  if (isEmpty(value)) {
    showFieldError(cvvInput, "請輸入安全碼");
    return false;
  }

  if (!/^\d{3}$/.test(value)) {
    showFieldError(cvvInput, "安全碼必須是 3 位數字");
    return false;
  }

  return true;
}

// 驗證金額：空白 -> 轉成數字確認有效 -> 範圍 1 ~ 50000
function validateAmount() {
  const rawValue = amountInput.value;

  if (isEmpty(rawValue)) {
    showFieldError(amountInput, "請輸入付款金額");
    return false;
  }

  const amount = Number(rawValue);

  if (!Number.isFinite(amount)) {
    showFieldError(amountInput, "請輸入有效金額");
    return false;
  }

  if (amount < 1 || amount > 50000) {
    showFieldError(amountInput, "金額必須介於 1 到 50000");
    return false;
  }

  return true;
}

// 5. 表單送出監聽事件（對應簡報第 12 頁）
form.addEventListener("submit", function (event) {
  // 阻止表單預設的重新整理與傳送行為
  event.preventDefault();

  // 先清除上一次的錯誤訊息
  clearErrors();

  // 依序執行四個欄位的檢查（使用變數接住結果，確保四個欄位都會被檢查並顯示各自錯誤）
  const cardOK = validateCardNumber();
  const expiryOK = validateExpiry();
  const cvvOK = validateCvv();
  const amountOK = validateAmount();

  // 全部通過才顯示成功訊息
  if (cardOK && expiryOK && cvvOK && amountOK) {
    result.textContent = "欄位檢查完成，測試交易通過";
    result.classList.add("success");
  }
});