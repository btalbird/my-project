/** Chrome PDF header/footer templates require inline styles and sans-serif fonts. */
export const CONFIDENTIAL_HEADER = `
  <div style="width:100%;text-align:center;font-size:14px;font-weight:700;color:#dc2626;font-family:sans-serif;letter-spacing:0.08em;">
    CONFIDENTIAL
  </div>`

export const PDF_FOOTER = "<span></span>"

export const PDF_MARGINS = {
  top: "72px",
  bottom: "48px",
  left: "24px",
  right: "24px",
} as const
