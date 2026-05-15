// pdfViewerUtil.js

export class PdfViewerUtil {
  /**
   * 打开新窗口查看（图片模式）
   */
  static openNewWindow(images = []) {
    const win = window.open("", "_blank");

    const html = `
      <html>
        <head>
          <title>预览</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial; }
            img { width: 100%; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          ${images.map(src => `<img src="${src}" />`).join("")}
        </body>
      </html>
    `;

    win.document.write(html);
    win.document.close();
  }

  /**
   * 打印（图片模式）
   */
  static print(images = []) {
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
      <html>
        <head>
          <title>打印</title>
          <style>
            body { margin: 0; }
            img { width: 100%; page-break-after: always; }
          </style>
        </head>
        <body>
          ${images.map(i => `<img src="${i}" />`).join("")}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }

  /**
   * 另存为（逐张下载）
   */
  static download(images = [], filenamePrefix = "document") {
    images.forEach((src, index) => {
      const a = document.createElement("a");
      a.href = src;
      a.download = `${filenamePrefix}-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }
}