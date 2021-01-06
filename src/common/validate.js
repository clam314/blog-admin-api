export const validateEmail = value => {
  value = String(value)
  if (!value || value === '') {
    return false
  }
  if (value !== '') {
    const reg = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
    if (!reg.test(value)) {
      return false
    }
  }
  return true
}

export const validateMobilePhone = (value) => {
  value = String(value)
  if (!value || value === '') {
    return false
  }
  if (value !== '') {
    const reg = /^1[3456789]\d{9}$/
    if (!reg.test(value)) {
      return false
    }
  }
  return true
}

export const validateStrLength = (value, min = 0, max = 0) => {
  value = String(value)
  if (!value || value === '') {
    return false
  } else if (min > 0 && value.length < min) {
    return false
  } else if (max > 0 && value.length > max) {
    return false
  } else {
    return true
  }
}

export const notNullObj = (obj) => {
  return Object.keys(obj).length > 0
}
