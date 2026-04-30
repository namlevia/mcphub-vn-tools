# Bộ MCPHub public tools Việt hoá

Không cần token/API key. Chạy bằng Node.js qua stdio.

## Server/tool tiếng Việt không dấu

- `thoi-tiet`
  - `thoi-tiet-hien-tai`
  - `thoi-tiet-du-bao`
- `ty-gia`
  - `ty-gia-xem`
  - `ty-gia-doi-tien`
- `crypto`
  - `crypto-gia`
- `tin-tuc`
  - `tin-tuc-moi-nhat`
- `xo-so`
  - `xo-so-mien-bac`
  - `xo-so-theo-mien`
- `lich`
  - `lich-hom-nay`
  - `lich-ngay-le-viet-nam`
- `gio-the-gioi`
  - `gio-the-gioi-xem`
- `ma-qr`
  - `ma-qr-tao-link`
- `tien-ich`
  - `tien-ich-uuid`
  - `tien-ich-mat-khau`
  - `tien-ich-base64-ma-hoa`
  - `tien-ich-base64-giai-ma`
  - `tien-ich-hash`
- `mau-sac`
  - `mau-sac-hex-sang-rgb`
  - `mau-sac-rgb-sang-hex`

## Config stdio mẫu

```json
{
  "type": "stdio",
  "command": "node",
  "args": ["/app/custom-mcp/vn-public-mcp.js", "thoi-tiet"],
  "env": {},
  "enabled": true
}
```

Đổi tham số cuối thành tên server mong muốn.

## Docker Compose mount

```yaml
volumes:
  - ./custom-mcp:/app/custom-mcp:ro
```

## Ghi chú

- Tên server/tool dùng tiếng Việt không dấu để tránh lỗi URL/CLI.
- MCPHub có thể tự prefix tool: server `thoi-tiet`, tool `hien-tai` sẽ gọi là `thoi-tiet-hien-tai`.
- Dữ liệu public có thể rate limit hoặc đổi cấu trúc. Xổ số nên đối chiếu nguồn khi dùng chính thức.

## Nhóm đời sống/giải trí thêm

- `xem-boi`
  - `xem-boi-tong-quan`
  - `xem-boi-cung-hoang-dao`
- `than-so-hoc`
  - `than-so-hoc-xem`
- `phong-thuy`
  - `phong-thuy-mau-hop-menh`
  - `phong-thuy-huong-nha`
- `nau-an`
  - `nau-an-cong-thuc`
  - `nau-an-thuc-don-gia-dinh`
- `hoc-ngoai-ngu`
  - `hoc-ngoai-ngu-gia-su-tieng-anh`
  - `hoc-ngoai-ngu-dich-va-giai-thich`
- `tu-van-nghe-nghiep`
  - `tu-van-nghe-nghiep-dinh-huong`
- `tu-van-luat`
  - `tu-van-luat-thong-tin-co-ban`
- `ly-thuyet-lai-xe`
  - `ly-thuyet-lai-xe-meo-hoc`
  - `ly-thuyet-lai-xe-tao-cau-hoi`
- `ma-so-thue`
  - `ma-so-thue-huong-dan-tra-cuu`
- `phat-nguoi`
  - `phat-nguoi-huong-dan-tra-cuu`

Lưu ý: bói/phong thủy/thần số học là giải trí/tham khảo; luật/sức khỏe không thay thế chuyên gia.

---

# Đóng gói chia sẻ GitHub

## Cài vào MCPHub đang chạy

1. Mount thư mục này vào container MCPHub:

```yaml
volumes:
  - ./custom-mcp:/app/custom-mcp:ro
  - ./data:/app/custom-mcp-data:ro
```

2. Đăng ký toàn bộ server:

```bash
MCPHUB_URL=http://127.0.0.1:33000 MCPHUB_USER=admin MCPHUB_PASS=admin123 \
  python3 scripts/register.py
```

3. Test nhanh:

```bash
python3 scripts/smoke.py
```

## Về dataset

Repo chỉ kèm dataset mẫu tự tạo/licensed-safe để demo:

- `data/driving-samples.json`
- `data/folk-remedies-samples.json`
- `data/jokes-samples.json`
- `data/myths-samples.json`

Các bộ dữ liệu như 600 câu ô tô/250 câu xe máy, tuyển sinh, luật, mã số thuế, phạt nguội... cần nguồn chính thức hoặc dữ liệu có quyền sử dụng. Không bypass captcha/paywall/điều khoản dịch vụ.

---

# Chính sách nguồn chính thức / hợp pháp

Repo này ưu tiên nguồn hợp pháp:

- API/RSS public có điều khoản cho phép dùng.
- Trang chính thức nhưng có captcha/session thì **không bypass**.
- Dataset không rõ bản quyền thì **không commit vào repo**; người dùng tự import local nếu có quyền.

Xem registry nguồn:

```text
data/sources.official.json
```

## Import dataset hợp pháp

Import JSON bất kỳ:

```bash
python3 scripts/import-json-dataset.py ./my-dataset.json ./data/my-dataset.local.json
```

Import bộ câu hỏi lái xe hợp pháp về format chuẩn:

```bash
python3 scripts/import-driving-dataset.py ./driving-legal.json ./data/driving-official.local.json
```

> Không commit dữ liệu có bản quyền/riêng tư nếu bạn không có quyền phân phối.

## Các tool dùng manual lookup vì nguồn chính thức có captcha/session

- `phat-nguoi`: https://www.csgt.vn/tra-cuu-phat-nguoi
- `ma-so-thue`: https://tracuunnt.gdt.gov.vn/tcnnt/mstcn.jsp

Các tool này trả link/hướng dẫn thay vì tự động vượt captcha.

## Dataset source registry

Repo có thêm file rà nguồn dataset:

```text
data/dataset-sources.vn.json
```

File này chia nguồn thành:

- `ready_public_sources`: dùng được ngay qua API/RSS/public CSV.
- `official_manual_sources`: nguồn chính thức nhưng phải tra cứu thủ công vì captcha/session/PII.
- `needs_legal_dataset_import`: cần dataset hợp pháp do người dùng tự cung cấp/import local.
- `rejected_or_unreliable_search_hits`: nguồn tìm thấy nhưng không đủ tin cậy/license để copy vào repo.

Nguyên tắc: **không copy dữ liệu không rõ quyền, không bypass captcha, không quảng cáo sample là official full dataset**.

## Dataset/source additions

Các file nguồn/dataset bổ sung:

```text
data/vn-provinces-sample.json
data/vn-holidays-sources.json
data/vn-banks-sources.json
data/open-data-sources.global.json
```

Gợi ý tool có thể thêm tiếp:

- `ngay-le-viet-nam`: gọi Nager.Date API.
- `tinh-thanh-viet-nam`: tra cứu tỉnh/thành từ sample hoặc dataset hành chính có license rõ.
- `ngan-hang-viet-nam`: adapter VietQR/BIN sau khi xác nhận điều khoản.
- `quoc-gia-tien-te`: gọi REST Countries.
- `chat-luong-khong-khi`: gọi OpenAQ nếu có API key/điều khoản phù hợp.
