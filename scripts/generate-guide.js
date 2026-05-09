import fs from 'fs'
import path from 'path'

const outputFile = path.resolve('Quiz-App-Step-by-Step-Guide.pdf')

const pageWidth = 595.28
const pageHeight = 841.89

function escapePdfText(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

function textLine(x, y, size, text, font = 'F1', color = '0 0 0') {
  return `BT\n/${font} ${size} Tf\n${color} rg\n${x} ${y} Td\n(${escapePdfText(text)}) Tj\nET\n`
}

function box(x, y, w, h, fill, stroke) {
  return `${fill} rg\n${stroke} RG\n${x} ${y} ${w} ${h} re\nB\n`
}

function drawStepSection(y, number, title, lines) {
  const x = 42
  const width = 511
  const height = 104
  const content = []
  content.push(box(x, y, width, height, '0.975 0.98 1', '0.82 0.86 0.95'))
  content.push(box(x, y, 8, height, '0.27 0.39 0.82', '0.27 0.39 0.82'))
  content.push(textLine(x + 22, y + 78, 12, `Step ${number}`, 'F2', '0.27 0.39 0.82'))
  content.push(textLine(x + 22, y + 60, 16, title, 'F2', '0.12 0.14 0.18'))

  let textY = y + 40
  for (const line of lines) {
    content.push(textLine(x + 22, textY, 10.5, line, 'F1', '0.28 0.30 0.35'))
    textY -= 14
  }

  return content.join('')
}

function pageHeader(title, subtitle, pageNumber) {
  return [
    '0.98 0.99 1 rg\n0 0 595 842 re f\n',
    '0.16 0.24 0.49 rg\n0 760 595 82 re f\n',
    textLine(42, 807, 24, title, 'F2', '1 1 1'),
    textLine(42, 786, 11.5, subtitle, 'F1', '0.92 0.95 1'),
    textLine(530, 30, 10, `Page ${pageNumber}`, 'F1', '0.45 0.48 0.56')
  ].join('')
}

function makePage1() {
  return [
    pageHeader('Quiz App Delivery Guide', 'A simple, clean plan to complete the task using UI/UX principles.', 1),
    drawStepSection(620, 1, 'Plan the experience', [
      'Keep the quiz flow short, clear, and focused.',
      'Use one primary action per screen.',
      'Choose a readable font, consistent spacing, and calm colors.'
    ]),
    drawStepSection(500, 2, 'Build the React interface', [
      'Create a single-page quiz layout.',
      'Add a question card, answer buttons, and a progress bar.',
      'Make feedback obvious with correct and incorrect states.'
    ]),
    drawStepSection(380, 3, 'Containerize with Docker', [
      'Use a multi-stage build for a small production image.',
      'Serve the app with Nginx.',
      'Expose the app on port 80 so deployment is predictable.'
    ])
  ].join('')
}

function makePage2() {
  return [
    pageHeader('Quiz App Delivery Guide', 'Continue with deployment, monitoring, and a final delivery checklist.', 2),
    drawStepSection(620, 4, 'Set up a simple AWS host', [
      'Use one EC2 instance instead of a complex cluster.',
      'Install Docker on the server.',
      'Open only the ports you need for the demo.'
    ]),
    drawStepSection(500, 5, 'Automate deployment', [
      'Build and test in GitHub Actions.',
      'Push the image to a registry.',
      'SSH into EC2 and restart the container with the new image.'
    ]),
    drawStepSection(380, 6, 'Add basic monitoring', [
      'Send container logs to CloudWatch or a similar log store.',
      'Track CPU usage and uptime.',
      'Keep alarms simple and actionable.'
    ]),
    box(42, 250, 511, 92, '0.12 0.14 0.18', '0.12 0.14 0.18'),
    textLine(64, 310, 13, 'Final checklist', 'F2', '1 1 1'),
    textLine(64, 290, 10.5, '• Clean UI with strong typography', 'F1', '0.92 0.95 1'),
    textLine(64, 276, 10.5, '• Dockerized app', 'F1', '0.92 0.95 1'),
    textLine(64, 262, 10.5, '• Automated build and deploy', 'F1', '0.92 0.95 1'),
    textLine(310, 290, 10.5, '• AWS EC2 hosting', 'F1', '0.92 0.95 1'),
    textLine(310, 276, 10.5, '• Logs and monitoring', 'F1', '0.92 0.95 1'),
    textLine(310, 262, 10.5, '• Clear README and guide', 'F1', '0.92 0.95 1')
  ].join('')
}

function buildPdf() {
  const objects = []
  const push = (body) => objects.push(body)

  const page1Content = makePage1()
  const page2Content = makePage2()

  push('<< /Type /Catalog /Pages 2 0 R >>')
  push('<< /Type /Pages /Kids [7 0 R 8 0 R] /Count 2 >>')
  push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
  push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>')
  push(`<< /Length ${Buffer.byteLength(page1Content, 'utf8')} >>\nstream\n${page1Content}endstream`)
  push(`<< /Length ${Buffer.byteLength(page2Content, 'utf8')} >>\nstream\n${page2Content}endstream`)
  push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents 5 0 R >>`)
  push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents 6 0 R >>`)

  let pdf = '%PDF-1.4\n'
  const offsets = ['0000000000 65535 f \n']
  let currentOffset = Buffer.byteLength(pdf, 'utf8')

  objects.forEach((body, index) => {
    const objectNumber = index + 1
    const obj = `${objectNumber} 0 obj\n${body}\nendobj\n`
    offsets.push(`${String(currentOffset).padStart(10, '0')} 00000 n \n`)
    pdf += obj
    currentOffset += Buffer.byteLength(obj, 'utf8')
  })

  const xrefOffset = Buffer.byteLength(pdf, 'utf8')
  pdf += `xref\n0 ${objects.length + 1}\n${offsets.join('')}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  fs.writeFileSync(outputFile, pdf)
}

buildPdf()
console.log(`Created ${outputFile}`)
