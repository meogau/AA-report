# Ghi chú đọc tay nhóm lõi

File này dùng để ghi lại phần đã đọc tay từ `T24.BP` để không phải quay lại đọc từ đầu.  
Nguyên tắc:
- Chỉ ghi điều đã thấy trực tiếp trong source.
- Với action, ghi file gốc và các routine con đã lần tới.
- Chỉ chuyển sang data website khi phần note của property đã đủ chắc.

## Tiến độ

- `BALANCE.AVAILABILITY`: đã đọc tay xong lớp field chính và action `UPDATE`.
- `BALANCE.MAINTENANCE`: đã đọc `FIELDS`, `UPDATE`, `DATA.CAPTURE`, `CAPTURE.BILL`; còn phải tổng hợp lại từng nhóm field và action.
- `INTEREST`: đã đọc thêm `VALIDATE`, `UPDATE`, `MAKE.DUE`, `COMMON.PROCESSING`; đã chốt được nhóm field chính và các action lõi `ACCRUE`, `UPDATE`, `MAKE.DUE`.
- `ACCOUNT`: đã đọc `FIELDS`, `UPDATE`, `PAY`, `MAKE.DUE`, `REPAY`; đã chốt được field nền và các action lõi chính.
- `CHARGE`: đã đọc `FIELDS`, `VALIDATE`, `MAKE.DUE`, `PROCESS.CHARGE.MAKE.DUE`, `REPAY`, `PAY`, `ACCRUE`, `CAPITALISE`; đã chốt nhóm field đầu và gần đủ trục action lõi.
- `PAYMENT.SCHEDULE`: đã đọc `FIELDS`, `UPDATE`, phần đầu `MAKE.DUE`, phần đầu `CAPITALISE`; đã chốt được `UPDATE` chỉ là wrapper và hai action bill-processing mới là lõi cần đào tiếp.

---

## Property class: BALANCE.AVAILABILITY

### Source đã đọc
- `T24.BP/AA.BALANCE.AVAILABILITY.FIELDS.b`
- `T24.BP/AA.BALANCE.AVAILABILITY.VALIDATE.b`
- `T24.BP/AA.BALANCE.AVAILABILITY.UPDATE.b`
- `T24.BP/AA.GET.BALANCE.AVAILABILITY.RECORD.b`

### Ghi nhận field chính

- `AA.BA.NOTICE.AMOUNT`
  Trường số tiền báo trước. Trong `FIELDS` khai báo kiểu tiền (`AMT`), gắn cùng cụm đa giá trị với `NOTICE.PERIOD` và `NOTICE.AVAILABILITY`.
  Trong `VALIDATE`, hệ thống lấy giá trị này theo từng đa giá trị, gọi `NOTICE.AMOUNT.VAL`, rồi kiểm tra lỗi qua `CHECK.ER`.
  Kết luận hiện tại: đây là số tiền dùng để kiểm tra/áp quy tắc notice trên từng cấu hình notice.

- `AA.BA.NOTICE.PERIOD`
  Trường kỳ hạn báo trước. Trong `FIELDS` khai báo kiểu `PERIOD`, độ dài 5 ký tự.
  Trong `VALIDATE`, hệ thống duyệt từng giá trị notice, đọc trường này, gọi `PERIOD.VAL`, rồi mới sang kiểm tra amount và availability.
  Kết luận hiện tại: đây là kỳ hạn notice mà engine dùng để hợp lệ hóa rule notice theo từng dòng cấu hình.

- `AA.BA.NOTICE.AVAILABILITY`
  Trường cách áp availability cho notice. Trong `FIELDS` là trường ký tự độ dài 3, đi cùng bộ notice.
  Trong `VALIDATE`, hệ thống đọc riêng trường này và gọi `AVAILABILITY.VAL`.
  Kết luận hiện tại: đây là cờ/giá trị chỉ cách áp dụng availability khi có notice amount + notice period.

- `AA.BA.CREDIT.CHECK`
  Trong `FIELDS` chỉ nhận các giá trị `WORKING`, `FORWARD`, `AVAILABLE`, `AVAILWORK`, `AVAILFWD`, `COMPONENT`.
  Trong `VALIDATE`, nếu `OVERDRAFT.PROCESSING = YES` mà `CREDIT.CHECK <> COMPONENT` thì hệ thống gắn lỗi `AA.BA.CREDIT.CHECK.MUST.BE.COMPONENT.FOR.NSF`.
  Đồng thời nếu giá trị bắt đầu bằng `AVAIL` mà `AVAIL.BAL.UPD` rỗng thì hệ thống gắn lỗi `AC.RTN.AVAILABLE.BAL.UPD.MISS.CREDIT.CHECK`.
  Kết luận hiện tại: đây là trường quyết định kiểu kiểm tra khả dụng tín dụng/số dư; khi đi vào NSF thì bắt buộc dùng mode `COMPONENT`.

- `AA.BA.AVAIL.BAL.UPD`
  Trong `FIELDS` chỉ nhận `BOTH`, `NONE`, `DEBITS`, `CREDITS`.
  Trong `VALIDATE`, trường này trở thành bắt buộc khi `CREDIT.CHECK` là một biến thể `AVAIL...`.
  Kết luận hiện tại: đây là cờ chỉ loại giao dịch nào được phép cập nhật available balance khi dùng nhóm kiểm tra `AVAILABLE`.

- `AA.BA.TOLERANCE.AMOUNT` và `AA.BA.TOLERANCE.CCY`
  Hai trường được validate như một cặp. `VALIDATE` có lỗi `AA.BA.DEFINE.BOTH.TOL.AMT.AND.TOL.CCY`.
  Kết luận hiện tại: đây là cặp ngưỡng tolerance, phải khai báo đồng thời số tiền và tiền tệ.

- `AA.BA.ACTIVITY.CLASS`, `AA.BA.ON.ACTIVITY`, `AA.BA.ACT.CREDIT.CHECK`, `AA.BA.LIMIT.CHECK`, `AA.BA.OVERDRAWN.ACTION`, `AA.BA.OD.CHARGE.ACTION`, `AA.BA.OD.CHARGE.REV.ACTION`
  Đây là cụm cấu hình NSF theo activity/activity class.
  `VALIDATE` cho thấy:
  - từ dòng đa giá trị thứ 2 trở đi, nếu khai báo cấu hình theo activity thì phải khai báo đầy đủ cặp activity/activity.class theo rule tương ứng;
  - nếu chưa bật `OVERDRAFT.PROCESSING` thì không được nhập `OVERDRAWN.ACTION` hoặc `OD.CHARGE.ACTION`;
  - nhiều lỗi `AA.BA.NSF.SETUP.NOT.ALLOWED` chặn cấu hình NSF sai tổ hợp.
  Kết luận hiện tại: đây là nhóm điều khiển cách hệ thống xử lý thấu chi/NSF theo từng activity hoặc activity class.

- `AA.BA.OVERDRAFT.PROCESSING`
  Trong `FIELDS` chỉ nhận `YES`.
  Trong `VALIDATE`, trường này là cờ bật toàn bộ xử lý NSF; khi rỗng thì nhiều field NSF phía sau bị cấm nhập, khi bật thì một số field trở thành bắt buộc.
  Kết luận hiện tại: đây là công tắc bật chế độ xử lý overdraft/NSF cho property.

### Action: UPDATE BALANCE.AVAILABILITY

### Source đã đọc
- `T24.BP/AA.BALANCE.AVAILABILITY.UPDATE.b`

### Kết luận đã chốt

- Ý nghĩa chung
  Action này không tự tính số dư hay ghi file nghiệp vụ riêng.
  Vai trò thật của nó là nhận ngữ cảnh activity hiện tại rồi gọi `AA.Framework.UpdateChangeCondition()` để đánh dấu thay đổi condition của property `BALANCE.AVAILABILITY`.

- Các bước đã chốt từ source
  1. `SET.ACTIVITY.DETAILS`
     Đọc trạng thái activity, id activity, record activity, action hiện tại, effective date và arrangement id từ `AF.Framework`/`AA.Framework`.
  2. `PROCESS.ACTION`
     Rẽ nhánh theo trạng thái `UNAUTH`, `DELETE`, `AUTH`, `REVERSE`.
  3. `INITIALISE`
     Xóa cờ lỗi `RET.ERROR`, `PROCESS.ERROR` và lấy `PROPERTY = AF.Framework.getPropertyId()`.
  4. `PROCESS.INPUT.ACTION`
     Gọi `AA.Framework.UpdateChangeCondition()`.
  5. `PROCESS.DELETE.ACTION`
     Gọi `AA.Framework.UpdateChangeCondition()`.
  6. `PROCESS.AUTHORISE.ACTION`
     Không có logic cập nhật riêng trong file hiện có.
  7. `PROCESS.REVERSE.ACTION`
     Gọi `AA.Framework.UpdateChangeCondition()`.
  8. `HANDLE.ERROR`
     Nếu có lỗi thì đưa vào `PROCESS.ERROR`, gọi `EB.SystemTables.setEtext(...)` và `EB.ErrorProcessing.StoreEndError()`.
  9. `UPDATE.LOG`
     Ghi log debug với routine `AA.BALANCE.AVAILABILITY.UPDATE`.

- Những gì chưa thấy trong source
  Không thấy file này trực tiếp `WRITE/FWRITE` vào bảng nghiệp vụ riêng.
  Không thấy trực tiếp update `AA.ARR.BALANCE.AVAILABILITY` trong thân routine này; phần ghi thực tế nhiều khả năng để framework condition update xử lý sau lời gọi `UpdateChangeCondition()`.

---

## Property class: BALANCE.MAINTENANCE

### Source đã đọc
- `T24.BP/AA.BALANCE.MAINTENANCE.FIELDS.b`
- `T24.BP/AA.BALANCE.MAINTENANCE.UPDATE.b`
- `T24.BP/AA.BALANCE.MAINTENANCE.DATA.CAPTURE.b`
- `T24.BP/AA.BALANCE.MAINTENANCE.CAPTURE.BILL.b`

### Ghi nhận field chính

- `RESTRICT.TYPE`
  Checkfile là `AC.BALANCE.TYPE`.
  Kết luận hiện tại: loại balance bị khóa hoặc bị giới hạn trong đợt balance maintenance.

- `RESTRICT.PROP`
  Checkfile là `AA.PROPERTY`.
  Kết luận hiện tại: property bị áp restriction trong xử lý maintenance.

- `ADJUST.DESC`
  Mô tả nghiệp vụ của lần điều chỉnh.

- `NET.ADJUST.AMT`
  Trường số tiền điều chỉnh ròng; trong lịch sử sửa đổi có ghi rõ hệ thống cập nhật lại `NET.ADJUST.AMT` trên `R.NEW`.

- `ADJUST.DIFF.ACC`
  Checkfile là `ACCOUNT`.
  Kết luận hiện tại: tài khoản đối ứng dùng để hạch toán chênh lệch adjustment.

- Nhóm `ADJUST.PROP`, `ADJ.BAL.TYPE`, `ORIG.BAL.AMT`, `NEW.BAL.AMT`, `ADJ.BAL.AMT`
  Đây là trục chính của adjust balance.
  `ADJUST.PROP` là property cần điều chỉnh.
  `ADJ.BAL.TYPE` là loại balance bên trong property đó.
  `ORIG.BAL.AMT` là số dư trước điều chỉnh.
  `NEW.BAL.AMT` là số dư mục tiêu sau điều chỉnh.
  `ADJ.BAL.AMT` là số tiền chênh lệch cần ghi nhận để từ số cũ sang số mới.

- `TOT.POS.ACC.AMT`, `TOT.NEG.ACC.AMT`
  Được thêm vào do enhancement negative interest rate.
  Kết luận hiện tại: cặp trường tổng hợp phần positive/negative accrued amount phục vụ xử lý interest âm.

- Nhóm bill `BILL.REF`, `OR.BILL.AMT`, `OS.BILL.AMT`, `NEW.BILL.AMT`, `DEL.BILL.AMT`, `WRITE.OFF.BILL`, `BILL.ADJ.NARR`
  Đây là cụm dùng khi maintenance tác động vào bill.
  Lịch sử sửa đổi và action `CAPTURE.BILL` cho thấy `DEL.BILL.AMT` liên quan trực tiếp tới delinquency outstanding amount.

### Action: UPDATE BALANCE.MAINTENANCE

- File đã đọc: `AA.BALANCE.MAINTENANCE.UPDATE.b`
- Kết luận hiện tại
  Action `UPDATE` ở file này chỉ là khung activity rất mỏng:
  - lấy ngữ cảnh activity và record `R.NEW`,
  - rẽ nhánh theo trạng thái activity,
  - không có xử lý nghiệp vụ chi tiết trong các nhánh,
  - nếu có lỗi thì set etext,
  - ghi log debug.
  Vì vậy nếu muốn mô tả logic thật của balance maintenance thì phải đọc các action nghiệp vụ khác như `DATA.CAPTURE` và `CAPTURE.BILL`, không thể dừng ở file `UPDATE`.

### Action: CAPTURE.BILL BALANCE.MAINTENANCE

- File đã đọc: `AA.BALANCE.MAINTENANCE.CAPTURE.BILL.b`
- Kết luận bước đầu
  Đây là action nghiệp vụ thật cho `LENDING-CAPTURE.BILL-BALANCE.MAINTENANCE`.
  Mục tiêu của nó là tạo/chỉnh bill, cập nhật amount của bill, cập nhật trạng thái settle/aging, cập nhật interest accrual và tax liên quan khi capture bill.
  Các điểm phải đọc sâu tiếp ở vòng sau:
  - update bill details,
  - update bill property amount,
  - update interest accrual khi current interest bị điều chỉnh,
  - xử lý trường hợp suspend / chargeoff / tax.

### Action: DATA.CAPTURE BALANCE.MAINTENANCE

- File đã đọc: `AA.BALANCE.MAINTENANCE.DATA.CAPTURE.b`
- Kết luận đã chốt
  Đây là action lõi thật của `BALANCE.MAINTENANCE`.
  Program description xác nhận routine này cập nhật `AA.ACTIVITY.BALANCES` theo property / balance type / amount, nhưng source cho thấy nó còn đi xa hơn:
  - cập nhật `AA.ACTIVITY.BALANCES` qua `AA.Framework.ProcessActivityBalances(...)` rồi ghi lại bằng `AA.Framework.UpdateActivityBalances(...)`,
  - cập nhật `AA.INTEREST.ACCRUALS` hoặc `AA.INTEREST.ACCRUALS.WORK` qua `AA.Interest.UpdateInterestAccruals(...)`,
  - đọc/ghi `BILL.DETAILS` qua `AA.PaymentSchedule.GetBillDetails(...)`, `AA.PaymentSchedule.UpdateBillPropertyAmount(...)`, `AA.PaymentSchedule.UpdateBillStatus(...)`, `AA.PaymentSchedule.UpdateBillDetails(...)`,
  - gọi `AA.PaymentSchedule.ProcessAccountDetails(...)` để xử lý write off balance và cooling date kiểu disburse,
  - cập nhật lại chính record `R.BALANCE.MAINTENANCE` trên `R.NEW` cho các amount bill sau adjust.

- Luồng tổng quát đã chốt từ source
  1. `PROCESS.INPUT.ACTION`
     Nếu activity là capture/adjust/writeoff balance thì:
     - gán `UPD.TYPE = "VAL"`,
     - gán `UPDATE.MODE = "BAL.ADJUST"`,
     - xóa các dòng adjust rỗng bằng `TRUNCATE.UNADJUSTED.BALANCES`,
     - cập nhật `AA.ACTIVITY.BALANCES`,
     - ghi lại `AA.ACTIVITY.BALANCES`,
     - tính `NET.ADJUST.AMT`,
     - cập nhật interest accruals.
     Nếu activity là adjust/writeoff bill thì gọi `PROCESS.BILL.UPDATES`.
     Nếu là writeoff balance thì gọi thêm `WRITE.OFF.BALANCE.PROCESS`.
     Nếu là capture balance trên takeover arrangement và product line không phải `ACCOUNTS` thì gọi `COOLING.DATE.PROCESS`.
  2. `PROCESS.DELETE.ACTION`
     Đổi `PROCESS.TYPE = "REVERSE"` rồi chạy lại `PROCESS.INPUT.ACTION`.
  3. `PROCESS.AUTHORISE.ACTION`
     Gán `UPD.TYPE = "AUT"`, sau đó:
     - với adjust/capture/writeoff balance: chuyển interest accrual từ work sang live bằng `UPDATE.INTEREST.ACCRUALS.AUTH`,
     - với adjust/writeoff bill: lấy danh sách interest property accrual-by-bills rồi gọi `AA.Interest.UpdateInterestAccruals("AUT", ...)` cho từng property và từng bill.
  4. `PROCESS.REVERSAL.ACTION`
     Chỉ gọi lại `PROCESS.DELETE.ACTION`.

- Chi tiết đã chốt cho nhánh balance
  1. `TRUNCATE.UNADJUSTED.BALANCES`
     Duyệt từng `BmAdjustProp` và `BmAdjBalType`.
     Nếu cả `BmNewBalAmt` lẫn `BmAdjBalAmt` của một dòng đều rỗng thì xóa đồng thời các trường:
     - `BmAdjBalType`
     - `BmOrigBalAmt`
     - `BmNewBalAmt`
     - `BmAdjBalAmt`
     - `BmWriteOff`
     - `BmWofAmount`
     - `BmTotPosAccAmt`
     - `BmTotNegAccAmt`
     Nếu sau khi xóa mà property không còn balance nào thì xóa luôn dòng `BmAdjustProp` và các field con tương ứng.
  2. `UPDATE.ACCOUNT.BALANCES`
     Lấy `ADJUST.PROPERTIES` từ `BmAdjustProp`, lấy `ADJUST.BALANCE.TYPES` từ `BmAdjBalType`.
     Nếu là writeoff balance thì ghép thêm suffix writeoff vào `ADJUST.BALANCES`.
     Sau đó gọi `PROCESS.BALANCE.ADJUSTMENT.AMOUNTS` để dựng mảng amount rồi chuyển toàn bộ sang `AA.Framework.ProcessActivityBalances(...)`.
  3. `PROCESS.BALANCE.ADJUSTMENT.AMOUNTS`
     Chọn cách tính amount theo loại activity:
     - capture balance: lấy trực tiếp từ `BmNewBalAmt`, `BmTotPosAccAmt`, `BmTotNegAccAmt`,
     - adjust balance: tính từ `BmNewBalAmt` hoặc `BmAdjBalAmt`,
     - writeoff balance: lấy từ `BmWofAmount`, nếu rỗng thì dùng `BmOrigBalAmt`.
  4. `CALCULATE.ADJUST.BALANCE.AMOUNTS`
     Với từng property/balance:
     - nếu có `NEW.BAL.AMT` thì tính `ADJUST.BALANCE.AMOUNTS = (ORIG - NEW) * -1`,
     - với product line khác `ACCOUNTS` và `ORIG.BAL.AMT > 0` thì lấy `ABS` trước khi tính,
     - nếu không có `NEW.BAL.AMT` nhưng có `ADJ.BAL.AMT` thì dùng trực tiếp `ADJ.BAL.AMT`,
     - nếu `PAYOFF.PROCESSING.REQD` thì cộng dồn current amount sang các biến payoff,
     - nếu arrangement đang charged off thì so lại customer amount với bank amount; nếu `ABS(CUSTOMER) < ABS(BANK)` thì raise override `AA.CUST.AMT.LT.BANK.AMT`.
  5. `CALCULATE.WRITEOFF.BALANCE.AMOUNTS`
     Mặc định lấy `BmOrigBalAmt`, nhưng nếu từng dòng có `BmWofAmount` thì đổi thành `BmWofAmount * -1`.
     Nếu đang payoff thì cộng dồn current amount.
     Nếu arrangement charged off thì gọi thêm `PROCESS.CHARGEOFF.WRITEOFF`.
  6. `PROCESS.CHARGEOFF.WRITEOFF`
     Chỉ chạy với property class `ACCOUNT` hoặc `INTEREST`.
     Lấy customer writeoff amount làm gốc, rồi đọc chargeoff rule `CfWriteoffOrder` từ payment rules của property `CHARGEOFF`.
     Theo thứ tự `BANK.FIRST` hoặc ngược lại, routine gọi `AA.Framework.GetPeriodBalances(...)` để lấy số dư BANK và CO hiện tại, rồi phân bổ writeoff amount vào các balance loại BANK / CO bằng cách thêm các dòng mới vào:
     - `ADJUST.BALANCE.TYPES`
     - `ADJUST.BALANCES`
     - `ADJUST.BALANCE.AMOUNTS`
  7. `WRITE.ACCOUNT.BALANCES`
     Ghi lại `R.AA.ACTIVITY.BALANCES` bằng `AA.Framework.UpdateActivityBalances(...)`.
  8. `CALCULATE.NET.ADJUSTMENT`
     Duyệt tất cả balance type, đọc `AC.BALANCE.TYPE` để lấy `BtReportingType`.
     Chỉ cộng vào `NET.ADJUSTMENT.AMT` nếu reporting type là `NON-CONTINGENT`.
     Ưu tiên amount theo thứ tự:
     - `BmWofAmount`
     - `BmAdjBalAmt`
     - nếu cả hai rỗng thì lấy `BmNewBalAmt - BmOrigBalAmt`
     Cuối cùng set vào `R.NEW` field `BmNetAdjustAmt`.

- Chi tiết đã chốt cho nhánh update interest accruals trong `DATA.CAPTURE`
  1. `UPDATE.INTEREST.ACCRUALS`
     Duyệt từng `BmAdjustProp`.
     Chỉ khi property class là `INTEREST` mới xử lý tiếp.
     Routine nạp `F.AA.PROPERTY` để kiểm tra property có type `SUSPEND` hay không rồi gọi `CHECK.INTEREST.BALANCE`.
  2. `CHECK.INTEREST.BALANCE`
     Duyệt từng balance đã adjust của property interest.
     Chỉ balance prefix `ACC` hoặc `RES` mới được coi là balance ảnh hưởng accrual.
     Từ suffix của balance, routine xác định `SUB.TYPE`:
     - không suffix đặc biệt: customer mặc định,
     - suffix `CO`: chargeoff,
     - còn lại: `BANK`.
  3. `UPDATE.TOTAL.INTEREST.AMOUNT`
     Đọc `AA.INTEREST.ACCRUALS` bằng `AA.Interest.GetInterestAccruals("VAL", ...)`.
     Xác định dấu cập nhật từ source balance type và payment mode `ADVANCE`.
     Với lending:
     - `ACC` hoặc `REC` gọi `GET.TOT.INT.AMT`,
     - `RES` gọi `GET.TOT.RES.AMT`,
     - nếu có amount thì gọi `GET.SUSPEND.AMOUNT`.
     Với non-lending:
     - `ACC` lấy amount từ `ADJUST.BALANCE.AMOUNTS.STORE`,
     - nếu là capture balance thì còn lấy split từ `BmTotPosAccAmt` và `BmTotNegAccAmt`,
     - `RES` thì ghi vào `TOTAL.RES.AMT`.
     Nếu account đang suspended và property có `SUSPEND`, routine còn tính `TOTAL.INT.SUSP.AMT`.
     Nếu reversal thì đảo dấu `TOTAL.INT.AMT` và `TOTAL.INT.SUSP.AMT`.
     Nếu có suspended amount thì tạo balance `ACC<property>SP` trong `AA.ACTIVITY.BALANCES`.
     Cuối cùng gọi `AA.Interest.UpdateInterestAccruals(...)` với:
     - total interest amount,
     - suspended amount,
     - residual amount,
     - update mode,
     - subtype customer/bank/co.
  4. `UPDATE.SPLIT.AMOUNT`
     Nếu user capture sẵn split dương/âm thì ghi chúng vào vị trí `<3>` và `<4>` của `TOTAL.INT.AMT`.
     Nếu không có split tay:
     - amount âm thì toàn bộ đi vào nhánh negative,
     - amount dương thì toàn bộ đi vào nhánh positive.
  5. `GET.SUSPEND.AMOUNT`
     Khi reversal thì đọc suspended amount đã adjust từ `AA.ACTIVITY.BALANCES`.
     Riêng browser request writeoff balance thì tính lại suspended portion bằng:
     - `AA.Interest.GetReaccrueDetails(...)`
     - `AA.Interest.GetBalanceAdjustmentAmount(...)`
     - `AA.Interest.AccrueInterest(...)`
     rồi cộng ra `SUSP.ADJUST.BALANCE.AMT`.

- Chi tiết đã chốt cho nhánh bill
  1. `PROCESS.BILL.UPDATES`
     Lấy danh sách `BILL.REF` từ `BmBillRef`.
     Nếu activity là `ADJUST.INFO.BILL` thì đi nhánh payoff bill, còn lại đi nhánh bill thường.
  2. `ADJUST.OTHER.BILLS`
     Với từng bill:
     - lấy `PAYMENT.TYPE`, `PAYMENT.METHOD`,
     - đọc `BILL.DETAILS`,
     - gọi `PROCESS.BILL`,
     - nếu bill có thay đổi thì:
       - với `PAYMENT.TYPE = CURRENT` gọi `UPDATE.CURRENT.INTEREST.ACCRUALS`,
       - cập nhật lại `R.BALANCE.MAINTENANCE` bằng `UPDATE.BILL.MAINT`,
       - kiểm tra có cần update delinquency không,
       - update `BdDelinOsAmt`,
       - nếu bill không rơi vào luồng phân bổ delinquency nhiều bill thì update status và ghi bill ngay,
       - nếu là payoff thì cập nhật payoff bill details.
     Sau vòng lặp, nếu có adjust/writeoff bill thì gọi `AA.PaymentSchedule.AccountDetailsRepay(...)` để đồng bộ `ALL.AGE.STATUS` trong account details.
  3. `UPDATE.BILL.MAINT`
     Ghi ngược amount từ `BILL.DETAILS` vào `R.BALANCE.MAINTENANCE`, gồm:
     - `BmOrBillAmt`
     - `BmOsBillAmt`
     - `BmOrPropAmt`
     - `BmOsPropAmt`
     - `BmOrBankAmt`
     - `BmOsBankAmt`
     Đồng thời kiểm tra `OS.SUS.PROP.AMT` không được âm.
  4. `UPDATE.DELIN.OS.AMT`
     Chỉ chạy khi bill type nằm trong setup overdue.
     Nếu adjust làm giảm delinquent amount vượt quá `BdDelinOsAmt` của bill hiện tại thì:
     - ghi bill hiện tại trước,
     - rồi lần các bill cũ hơn có delinquency để trừ tiếp phần dư.
     Mỗi lần trừ đều cập nhật:
     - `BdDelinOsAmt`
     - `BdDelinRepRef`
     - `BdDelinAmt`
     Khi reversal thì xóa dòng reference tương ứng activity hiện tại và khôi phục `BdDelinOsAmt` từ `BmDelBillAmt`.
  5. `UPDATE.BILL.STATUS`
     Quyết định có đổi `BILL.STATUS`, `SETTLE.STATUS`, `AGING.STATUS` hay không dựa trên:
     - `UPDATE.TYPE` = `WRITEOFF` / `ADJUST` / `RESTRUCTURE`,
     - `PROCESS.TYPE` = `UPDATE` / `REVERSE`,
     - `BdOsTotalAmount`,
     - `BdDelinOsAmt`,
     - `BdBillStatus`,
     - `BdAgingStatus`.
     Sau khi đổi trạng thái bằng `AA.PaymentSchedule.UpdateBillStatus(...)`, routine còn chạy `BILL.STATUS.REVISIT` để sửa lại trường hợp bill nhiều payment type bị set settled sai.
  6. `WRITE.BILL.DETAILS`
     Ghi bill bằng `AA.PaymentSchedule.UpdateBillDetails(ARRANGEMENT.ID, PROCESS.TYPE, BILL.REF, BILL.DETAILS, ...)`.

---

## Property class: INTEREST

### Source đã đọc
- `T24.BP/AA.INTEREST.FIELDS.b`
- `T24.BP/AA.INTEREST.ACCRUE.b`
- `T24.BP/AA.ACCRUE.INTEREST.b`
- `T24.BP/AA.INTEREST.VALIDATE.b`
- `T24.BP/AA.INTEREST.UPDATE.b`
- `T24.BP/AA.INTEREST.MAKE.DUE.b`
- `T24.BP/AA.INTEREST.COMMON.PROCESSING.b`

### Kết luận đã chốt về field

- Nhóm nền tảng cách tính lãi
  - `DAY.BASIS`
    Cơ sở đếm ngày để tính lãi. `FIELDS` check sang `INTEREST.BASIS`.
    `VALIDATE` có logic mặc định/kiểm tra field này theo currency và option last day inclusive, nên đây là tham số lõi để engine biến số ngày thành accrual amount.
  - `ACCRUAL.RULE`
    Mã rule accrual lấy từ `EB.ACCRUAL.PARAM`.
    Đây là field tham số hóa quyết định cách engine quản lý accrual, không phải ghi chú mô tả tự do.
  - `RATE.TIER.TYPE`
    Chọn kiểu áp tier: `SINGLE`, `BAND`, `LEVEL`.
    `VALIDATE` dùng field này để chặn compound interest với banded rates và bắt buộc nhập `TIER.AMOUNT` khi có nhiều tier.
  - `RATE.TYPE`
    Kiểu tính lãi ở mức nghiệp vụ: `REDUCING.RATE`, `FLAT.RATE`, `FLAT.AMOUNT`.
  - `INTEREST.METHOD`
    Field điều khiển phương pháp nội bộ của engine; trong `FIELDS` hiện thấy `FIXED` và bị `NOCHANGE`.

- Nhóm nguồn rate và cách lấy rate
  - `FIXED.RATE`
    Rate cố định nhập trực tiếp. `UPDATE.NOMINAL.RATE` ưu tiên dùng field này để tính `EFFECTIVE.RATE`.
  - `FLOATING.INDEX`
    Mã basic interest index tra từ `BASIC.RATE.TEXT`.
    `UPDATE` gọi `ST.RateParameters.EbGetInterestRate(index + currency + effective date)` để lấy rate nền.
    Nếu field này đổi, `UPDATE` còn cập nhật interest key và schedule activity `CHANGE` / `APPLY.RATE`.
  - `FLOATING.NOTICE`
    Kỳ notice đi kèm floating rate setup.
  - `PERIODIC.INDEX`
    Mã periodic interest table.
    `COMMON.PROCESSING` và `UPDATE` dùng field này để tính lại periodic/effective rate và để dựng lịch `PERIODIC.RESET`.
  - `PERIODIC.PERIOD.TYPE`
    Chọn loại kỳ dùng khi tra periodic rate: maturity, renewal, reset period hoặc periodic period.
  - `PERIODIC.PERIOD`
    Kỳ cụ thể để lookup periodic rate.
  - `PERIODIC.METHOD`
    Cách chọn rate từ bảng periodic: `INTERPOLATE`, `PREVIOUS`, `NEXT`, `CLOSEST`.
  - `PERIODIC.RATE`
    Rate periodic sau khi tra/nhập.
  - `INITIAL.RESET.DATE`
    Mốc reset đầu tiên để engine tính next periodic reset date.
  - `PERIODIC.RESET`
    Tần suất reset periodic index; nếu đổi/xóa thì `UPDATE` sẽ xóa lịch reset cũ và dựng lại `AA.SCHEDULED.ACTIVITY`.
  - `LINKED.RATE`, `LINKED.ARRANGEMENT`, `LINKED.PROPERTY`
    Bộ field lấy weighted average rate từ arrangement/property khác.
    `UPDATE.NOMINAL.RATE` gọi `AA.Interest.GetLinkedInterestRate(...)`.
    `UPDATE` đồng thời cập nhật liên kết bằng `AA.Framework.UpdateArrangementInterestLink(...)`.
  - `CUSTOM.RATE`, `CUSTOM.RATE.CALC`, `RUNTIME.RATE.CALC`
    Bộ field cho custom rate.
    `UPDATE.VALIDATE.CUSTOM.INTEREST` chốt rõ nghĩa:
    nếu `CUSTOM.RATE = YES`, `RUNTIME.RATE.CALC` không bật và `EFFECTIVE.RATE` vẫn rỗng thì báo lỗi.

- Nhóm margin, cap/floor, negative rate
  - `USAGE.PERCENT`
    Tỷ lệ áp trên reference rate trước khi cộng/trừ margin.
  - `MARGIN.TYPE`, `MARGIN.OPER`, `MARGIN.RATE`
    Bộ margin theo tier; `UPDATE.NOMINAL.RATE` truyền cả bộ này vào routine tính `EFFECTIVE.RATE`.
  - `TIER.MIN.RATE`, `TIER.MAX.RATE`
    Giới hạn sàn/trần trên từng tier.
  - `NEGATIVE.RATE`, `TIER.NEGATIVE.RATE`
    Cờ cho phép/chặn rate âm hoặc chặn theo kiểu `BLOCK.MARGIN`, `FLOOR.MARGIN`.
    `VALIDATE` có lịch sử sửa cho thấy rate âm bị khống chế theo source balance type.
  - `EFFECTIVE.RATE`
    Rate cuối cùng sau khi áp base rate, usage percent, margin, cap/floor, relationship pricing.
    `COMMON.PROCESSING` và `UPDATE.NOMINAL.RATE` đều ghi lại field này trên `R.NEW`.

- Nhóm tier/bậc lãi
  - `TIER.AMOUNT`
    Ngưỡng amount của từng bậc.
  - `TIER.PERCENT`
    Tỷ lệ phân bổ theo bậc phần trăm.
  - `ON.ACTIVITY`
    Danh sách activity làm hệ thống tính lại periodic/floating interest.
  - `RECALCULATE`
    Với từng `ON.ACTIVITY`, chỉ loại tính lại: không làm gì, tính rate, tính profit amount, hoặc cả hai.

- Nhóm compound / advance / upfront profit / minimum interest
  - `COMPOUND.TYPE`
    Kiểu compound.
  - `COMPOUND.YIELD.METHOD`
    Cách xử lý yield cho compound; `VALIDATE` chặn một số tổ hợp không hợp lệ.
  - `ACCOUNTING.MODE`
    Field cực quan trọng, thấy trực tiếp các option `ADVANCE`, `UPFRONT.PROFIT`.
    `MAKE.DUE` và `DATA.CAPTURE` dùng field này để quyết định:
    - update due amount kiểu advance,
    - dùng balance `REC` thay cho `ACC` khi upfront profit,
    - cách cập nhật `AA.INTEREST.ACCRUALS`.
  - `ACTUAL.PROFIT.AMT`, `ORIG.PROFIT.AMOUNT`
    Các field số tiền profit cho flow islamic/upfront profit.
  - `MIN.INT.AMOUNT`, `MIN.INT.WAIVE`
    Bộ minimum interest.
    `MAKE.DUE.ADJUST.MIN.INT.AMOUNT` gọi `AA.Interest.AdjustMinInterest(...)`.
    `MIN.INT.WAIVE` quyết định phần lãi dưới ngưỡng có được waive hay không.

- Nhóm suppress / alternate / adjustment / residual
  - `SUPPRESS.ACCRUAL`
    Có các option `YES`, `ALTERNATE`, `INFO.ONLY`.
    `UPDATE.CHECK.SUPPRESS.REQUIRED` còn có thể tự set lại field này theo restructure rules.
    `MAKE.DUE.CYCLE.INTEREST.PERIODS` nếu `INFO.ONLY` thì cycle cả actual lẫn info-only subtype.
  - `ADJUST.TYPE`, `ADJUST.OPERAND`, `ADJUST.MARGIN`, `ADJUST.OVERRIDE.RATE`, `ADJUST.REASON`, `ADJUST.EXPIRY.DATE`
    Bộ field điều chỉnh rate tạm thời.
    `UPDATE.PROCESS.ADJUSTMENT.EXPIRY` dùng `ADJUST.EXPIRY.DATE` để schedule/clear activity hết hạn adjustment.
  - `RESIDUAL.ACCRUAL`
    Không phải tên field trong `FIELDS`, nhưng là property option mà `MAKE.DUE` dùng để bật `PROCESS.RESIDUAL.INTEREST`.

- Nhóm pricing / relationship / limit / package
  - `USE.PRICING.GRID`
    Nếu bằng `YES` và activity class có option `EVALUATE.GRID`, `UPDATE` sẽ evaluate grid và ghi lại rate/margin.
  - `USER.*`
    Bộ `USER.RATE.TYPE`, `USER.FIXED.RATE`, `USER.FLOATING.INDEX`, `USER.PERIODIC.*`, `USER.CUSTOM.RATE`, `USER.LINKED.RATE`, `USER.MARGIN.*`
    Đây là lớp field giữ input gốc của user để engine so sánh/ghi đè với bộ rate chuẩn.
  - `RELATIONSHIP.PRODUCT`, `RELATIONSHIP.OPERAND`, `RELATIONSHIP.MARGIN`, `RELATIONSHIP.FIXED.RATE`
    Bộ pricing theo relationship; `UPDATE.NOMINAL.RATE` truyền operand/margin này vào routine tính effective rate.
  - `REFER.LIMIT`
    Cờ nối interest với limit; `UPDATE.CHECK.REFER.LIMT.CHANGE` cho thấy đổi field này sẽ trigger maintain-account / secondary activity.
  - `REGIONAL.PRICING.*`, `PRICING.RULES.*`, `PROGRAM.LIMIT`, `PACKAGE.PRODUCT`, `PACKAGE.PROPERTY.CONTROL`
    Đây là nhóm field tích hợp pricing/rules/package, hiện đã thấy rõ ở mức mục đích cấu hình; action lõi tôi chưa đi sâu hơn ngoài pricing-grid evaluation.

### Action: ACCRUE INTEREST

### Source đã đọc
- `T24.BP/AA.INTEREST.ACCRUE.b`
- `T24.BP/AA.ACCRUE.INTEREST.b`

### Kết luận đã chốt

- Ý nghĩa chung
  Đây là action accrual thực sự của property `INTEREST`.
  File `AA.INTEREST.ACCRUE.b` là routine điều phối theo activity và trạng thái.
  File `AA.ACCRUE.INTEREST.b` là routine tính toán accrual amount cho một property tới `ACCRUE.TO.DATE`, trả về phần accrual chi tiết và số tiền commit theo kỳ kế toán.

- Các bước khung đã chốt từ `AA.INTEREST.ACCRUE.b`
  1. `SET.ACTIVITY.DETAILS`
     Lấy trạng thái activity, full status, activity id, action, effective date, arrangement id, property class id, property id, activity id hiện tại.
  2. `CHECK.CHARGEOFF.STATUS`
     Gọi `AA.Interest.GetAccrualProcessTypes(...)` và `AA.ChargeOff.GetChargeoffDetails(...)` để biết contract đang ở trạng thái chargeoff nào.
  3. `DETERMINE.DELETE.PROCESS.REQUIRED`
     Xác định có cần xóa/khôi phục accrual khi delete/reverse hay không.
  4. `MAIN.PROCESS`
     Rẽ nhánh theo trạng thái input, delete, auth, reverse.
  5. Trong nhánh input:
     - `INITIALISE`
     - `SET.PAYOFF.FLAG`
     - `GET.PARTICIPANT.FLAG`
     - `CHECK.SUSPENSION`
     - `PROCESS.ACCRUAL`
  6. `PROCESS.ACCRUAL`
     - xác định kỳ bắt đầu/kết thúc (`GET.PERIOD.START.END.DATE`)
     - xác định `ACCRUE.TO.DATE` (`GET.ACCRUE.TO.DATE`)
     - lấy hoặc chuẩn bị accrual details hiện tại (`AA.Interest.GetInterestAccruals`)
     - nếu có projection thì lấy projection accruals (`AA.Interest.GetProjectionAccruals`)
     - nếu cần tính accrual thật thì gọi `AA.Interest.AccrueInterest(...)`, thực chất map tới routine `AA.ACCRUE.INTEREST.b`
  7. Sau tính toán:
     - nếu accrue by bills thì đi nhánh `GET.ACCRUAL.BILLS` / `BILL.INTEREST.UPDATE`
     - nếu cần cập nhật file accrual thì gọi `AA.Interest.UpdateInterestAccruals(...)`
     - nếu có accounting event thì gọi `AA.Accounting.AccountingManager(...)`

- Những gì đã chốt từ `AA.ACCRUE.INTEREST.b`
  Routine này là lõi tính toán.
  Program description xác nhận:
  - tính accrual tới `ACCRUE.TO.DATE`,
  - trả về accrual split giữa current month / previous month / previous year,
  - có thể dùng current accrual data truyền vào hoặc tự đọc lại.

  Từ source đã chốt được các vai trò đầu vào:
  - `CONTRACT.ID`: arrangement id
  - `PROPERTY`: property cần accrual
  - `PERIOD.START.DATE`, `PERIOD.END.DATE`: kỳ interest hiện tại
  - `ACCRUE.TO.DATE`: ngày cuối để tính accrual
  - `R.ACCRUAL.DATA`, `R.ACCRUAL.DETAILS`: dữ liệu accrual hiện có
  - `FIXED.INT`: lãi cố định cho linear accrual
  - `COMMITTED.INT`: mảng kết quả số tiền accrual tách theo bucket kế toán

- Điểm cần đọc tiếp để hoàn tất mô tả action `ACCRUE`
  - các para bên trong `AA.ACCRUE.INTEREST.b` nơi gọi sang balance basis / perform accrual / update principal data
  - `AA.Interest.UpdateInterestAccruals(...)` map sang file đích để chốt “update bảng nào, trường nào”

### Action: UPDATE INTEREST

### Source đã đọc
- `T24.BP/AA.INTEREST.UPDATE.b`
- `T24.BP/AA.INTEREST.COMMON.PROCESSING.b`

### Kết luận đã chốt

- Ý nghĩa chung
  `UPDATE` không phải action tính accrual hay chuyển lãi sang due.
  Vai trò chính của nó là:
  - tính/cập nhật lại `EFFECTIVE.RATE`,
  - cập nhật interest keys trong accrual record,
  - dựng/xóa lịch `CHANGE`, `PERIODIC.RESET`, `APPLY.RATE`,
  - cập nhật change condition,
  - đồng bộ pricing grid / linked arrangement / refer limit.

- Các bước chính
  1. `INITIALISE`
     Lấy `PROPERTY`, `ACTIVITY.ID`, `R.NEW`, currency, product line; đọc `F.AA.PROPERTY`.
     Tại đây routine xác định property có `ACCRUAL.BY.BILLS` hay `FORWARD.DATED` hay không.
  2. `CHECK.ON.ACTIVITY`
     Dựa trên `ON.ACTIVITY` + `RECALCULATE` để set `REQUEST.TYPE`.
  3. `AA.Interest.InterestCommonProcessing(REQUEST.TYPE, RET.ERROR)`
     Routine con `AA.INTEREST.COMMON.PROCESSING.b` lấy `PROPERTY.EFF.DATE`, arrangement currency, `R.NEW` rồi gọi `AA.Interest.GetEffectiveRate(...)`.
     Kết quả được ghi lại ngay vào `R.NEW`.
  4. `VALIDATE.CUSTOM.INTEREST`
     Nếu tier nào có `CUSTOM.RATE = YES` mà `RUNTIME.RATE.CALC` không bật và `EFFECTIVE.RATE` rỗng thì set lỗi.
  5. `UPDATE.INT.KEYS`
     Gọi `AA.Interest.UpdateInterestAccruals(...)` theo mode `VAL/REV/DEL/AUT` để đồng bộ index/payment mode vào accrual record.
     Key đáng chú ý:
     - `<3> = ADVANCE` khi `ACCOUNTING.MODE = ADVANCE`
     - `<4> = ABB.NEW.PROCESS` khi property dùng accrual-by-bills new method trên new arrangement
  6. `PROCESS.FLOATING.CHANGES`
     Nếu có `FLOATING.INDEX`, routine tính `NEXT.CYCLED.DATE` bằng `AA.Interest.GetNextFloatingDate(...)` rồi update scheduled activity `CHANGE-<property>`.
     Nếu phát hiện future BI change thì còn đánh dấu để schedule `APPLY.RATE`.
  7. `PROCESS.PERIODIC.CHANGES`
     Nếu property có `PERIODIC.INDEX` / `PERIODIC.RESET` / `INITIAL.RESET.DATE`, routine:
     - xác định có cần xóa schedule cũ không,
     - đọc date convention từ property `ACCOUNT`,
     - gọi `AA.Interest.GetPeriodicRecalcDate(...)`,
     - update scheduled activity `PERIODIC.RESET`.
  8. `UPDATE.CHANGE.CONDITION`
     Nếu property không có type `FORWARD.DATED`, gọi `AA.Framework.UpdateChangeCondition()`.
  9. `CHECK.REFER.LIMT.CHANGE`
     Nếu `REFER.LIMIT` đổi thì trigger maintain-account hoặc secondary activity tương ứng.
  10. `PROCESS.PRICING.GRID`
      Nếu `USE.PRICING.GRID = YES` và activity class cho phép evaluate grid:
      - đọc condition `PRICING.GRID`,
      - gọi `AA.PricingGrid.EvaluatePricingGrid(...)`,
      - update lại `FIXED.RATE`, `MARGIN.TYPE`, `MARGIN.OPER`, `MARGIN.RATE`,
      - tính lại `EFFECTIVE.RATE`.
  11. `UPDATE.ARRANGEMENT.LINK`
      Đồng bộ link giữa source property và target pricing-grid/linked-interest arrangement.

- File/bảng cập nhật thấy trực tiếp
  - `R.NEW` của property `INTEREST`:
    - `EFFECTIVE.RATE`
    - `FIXED.RATE`
    - `MARGIN.TYPE`
    - `MARGIN.OPER`
    - `MARGIN.RATE`
    - `SUPPRESS.ACCRUAL`
    - các field adjustment/grid liên quan
  - `AA.INTEREST.ACCRUALS` / `AA.INTEREST.ACCRUALS.WORK`
    qua `AA.Interest.UpdateInterestAccruals(...)`
  - `AA.SCHEDULED.ACTIVITY`
    qua `AA.Framework.SetScheduledActivity(...)`
  - arrangement-interest link
    qua `AA.Framework.UpdateArrangementInterestLink(...)`

### Action: MAKE.DUE INTEREST

### Source đã đọc
- `T24.BP/AA.INTEREST.MAKE.DUE.b`

### Kết luận đã chốt

- Ý nghĩa chung
  Đây là action thực sự chuyển lãi từ accrued sang due/payable.
  Routine này:
  - lấy bill `PAYMENT`,
  - đọc amount của property interest trên bill,
  - dựng accounting entry giữa `ACC`, `DUE`, `PAY`, `DEF`, `REC`, `...SP`,
  - xử lý waive, suspend, residual interest,
  - cycle period trong accrual record,
  - authorise/delete/reverse accounting và accrual update.

- Các bước chính
  1. `INITIALISE`
     Lấy `PROPERTY`, `ACTIVITY.ID`, `R.ACCRUAL.DETAILS`, `ADVANCE.FLAG`, residual process flag, alternate-interest flag, closure/payoff trigger.
  2. `CHECK.DEFER.RELATED.PROCESSING`
     Dựa vào `IntAccPeriodEnd` so với `EFFECTIVE.DATE` để quyết định đây là defer-related processing hay không.
  3. `GET.BALANCE.TYPES`
     Lấy tên balance thật cho property: `DUE`, `ACC`, `PAY`, `DEF`, `REC`.
  4. `GET.BILL`
     Gọi `AA.PaymentSchedule.GetBill(...)` để lấy danh sách bill `PAYMENT`.
     Tùy activity mà lấy bill theo effective date, theo master activity hoặc lấy cả deferred/non-deferred bill.
  5. Lặp từng `BILL.REFERENCE`
     - đọc `BILL.DETAILS`,
     - lọc chỉ bill chứa property hiện tại và payment method `DUE` hoặc `PAY`,
     - với subtype `CUST` thì bỏ qua bill không phải `DUE`.
  6. `GET.DUE.AMOUNTS`
     Đọc lần lượt từ bill:
     - `SUSPEND` amount,
     - `WAIVE` amount,
     - `DUE` amount thật của property bằng `AA.PaymentSchedule.GetBillPropertyAmount(...)`.
     Nếu là negative interest và không phải advance thì đảo dấu khi set `DUE.PROPERTY.AMOUNT`.
  7. `BUILD.EVENT.DETAILS`
     Xác định cặp balance accounting:
     - bill `DUE`: `DEBIT = DUE`, `CREDIT = ACC`; nếu `UPFRONT.PROFIT` thì `CREDIT = REC`; nếu deferred thì `CREDIT = DEF`
     - bill `PAY`: `DEBIT = ACC` hoặc `DEF`, `CREDIT = PAY`
     - bill suspend dùng balance `...SP`
  8. `BUILD.ACCOUNTING.UPDATES`
     Dựng `EVENT.REC` gồm:
     - `eventType`
     - `amount`
     - `sign`
     - `balanceType`
     - `valueDate`
     - `reversalInd`
     - `contraTarget`
     rồi dồn vào `MULTI.EVENT.REC`.
  9. `PROCESS.RESIDUAL.INTEREST`
     Nếu property có residual accrual:
     - gọi `AA.Interest.GetAdjustedInterestAmount(...)`
     - tính `RESIDUAL.INTEREST`
     - raise accounting cho residual amount
     - nếu arrangement suspended thì còn chuyển residual suspended amount sang `RESSP`
  10. `ADJUST.MIN.INT.AMOUNT`
      Đọc accrued amount thật từ `AA.INTEREST.ACCRUALS`, gọi `AA.Interest.AdjustMinInterest(...)`, nếu có `MIN.ADJ.AMOUNT` thì thêm accounting event điều chỉnh.
  11. `PROCESS.ACCOUNTING.UPDATES`
      Gọi `AA.Accounting.AccountingManager(...)` để:
      - `VAL`: đẩy toàn bộ `MULTI.EVENT.REC`
      - `DEL` / `AUT`: xử lý queue accounting tương ứng
  12. `CYCLE.INTEREST.PERIODS`
      Gọi `AA.Interest.MaintainInterestPeriods(...)` để đóng/mở kỳ trong accrual record.
      Tham số quan trọng gồm:
      - `UPD.MODE = CYCLE` hoặc `ADVANCE.CYCLE`
      - `DUE.PROPERTY.AMOUNT`
      - `MIN.ADJ.AMOUNT`
      - `REVERSAL.MODE`
      - `RESIDUAL.INTEREST`
      - `SUB.TYPE`
  13. Với advance mode
      Sau make due, routine còn gọi `AA.Interest.UpdateInterestAccruals("VAL", ...)` với `UPD.MODE = DUE.UPDATE` để đồng bộ `TOT.DUE.AMT`.
  14. `PROCESS.AUTHORISE.ACTION`
      Gọi `AccountingManager("AUT", ...)` và nếu không phải deferred processing thì authorise luôn `AA.INTEREST.ACCRUALS`.
  15. `PROCESS.DELETE.ACTION` / `PROCESS.REVERSE.DELETE.ACTION` / `PROCESS.REVERSE.ACTION`
      - delete: xóa accounting queue
      - reverse: chạy lại input logic với `REVERSAL.MODE = YES`
      - reverse-delete: xóa accounting rồi đọc bill lại để khôi phục due amount vào accrual record

- File/bảng cập nhật thấy trực tiếp
  - `AA.INTEREST.ACCRUALS` / `AA.INTEREST.ACCRUALS.WORK`
    qua `AA.Interest.UpdateInterestAccruals(...)` và `AA.Interest.MaintainInterestPeriods(...)`
  - queue/accounting entries
    qua `AA.Accounting.AccountingManager(...)`
  - `BILL.DETAILS`
    file này chủ yếu được đọc để lấy amount; ghi bill trực tiếp không nằm trong `AA.INTEREST.MAKE.DUE.b`

---

## Property class: ACCOUNT

### Source đã đọc
- `T24.BP/AA.ACCOUNT.FIELDS.b`
- `T24.BP/AA.ACCOUNT.UPDATE.b`
- `T24.BP/AA.ACCOUNT.PAY.b`
- `T24.BP/AA.ACCOUNT.MAKE.DUE.b`
- `T24.BP/AA.ACCOUNT.REPAY.b`

### Ghi nhận field chính

- Nhóm định danh account và hiển thị
  - `ACCOUNT.REFERENCE`
    Số account tham chiếu/chỉ định. `FIELDS` để kiểu `ACC` và `NOCHANGE`.
    `AA.ACCOUNT.UPDATE.GET.ACCOUNT.NUMBER` cho thấy nếu arrangement chưa có linked application `ACCOUNT` thì field này có thể được dùng để gắn account vào arrangement qua `AA.Account.UpdateLinkApplication("ACCOUNT", ACCOUNT.NO, ...)`.
  - `ALT.ID.TYPE`, `ALT.ID`
    Bộ alternate account id.
    `UPDATE.GET.ALT.ACCT.ID` gọi local routine `AC.AccountOpening.AcGetAltAcctId(...)` để sinh/kiểm tra trùng, rồi ghi ngược lại `R.NEW`.
  - `ACCOUNT.TITLE.1`, `ACCOUNT.TITLE.2`, `SHORT.TITLE`, `MNEMONIC`
    Các field tên/mô tả account hiển thị ra bên ngoài; `FIELDS` đánh dấu personal-data metadata cho các field này.
  - `ACCOUNT.ALIAS`
    Alias bổ sung cho account.
  - `CUSTOMER.REFERENCE`
    Mã tham chiếu khách hàng trên account, cũng được đánh dấu personal-data.

- Nhóm phân loại và tiền tệ
  - `CATEGORY`
    Category account, check sang bảng `CATEGORY`.
  - `CURRENCY`
    Tiền tệ chính của account, `NOCHANGE`.
  - `CURRENCY.MARKET`
    Thị trường tiền tệ, `NOINPUT` ở cấp field để tránh bị OFS/import đẩy sai.
  - `POSITION.TYPE`
    Loại vị thế FX/SSS của account, `NOINPUT`.
  - `ACCOUNTING.COMPANY`
    Company dùng để book giao dịch của underlying account.
  - `BASE.CURRENCY.RATE`
    Tỷ giá base currency lưu ngay trên property account.

- Nhóm lịch và ngày mốc
  - `BASE.DATE.TYPE`
    Kiểu ngày gốc, hiện thấy option `AGREEMENT_START`.
    `UPDATE.UPDATE.ANNIVERSARY.DATE` dùng field này để tính lại anniversary date.
  - `ANNIVERSARY`
    Ngày MMDD kỷ niệm/cycle của account.
    `UPDATE` không tin tuyệt đối vào input mà gọi `AA.Account.DetermineAnniversaryDate(...)` để tính lại, rồi set thẳng `AcAnniversary` trên `R.NEW`.
  - `DATE.CONVENTION`, `DATE.ADJUSTMENT`, `BUS.DAY.CENTRES`
    Bộ date handling phục vụ lịch/payment schedule/interpolation.
  - `BASE.DATE.KEY`
    Khóa phụ cho tính ngày base.
  - `PARENT.BV.DATE`, `ALLOWED.BV.DATE`
    Hai field kiểm soát booking value date/cover control.

- Nhóm hạn chế, mandate, trạng thái phụ
  - `POSTING.RESTRICT`
    Tập posting restriction nhiều giá trị, check sang `POSTING.RESTRICT`.
  - `BLOCKING.CODE`, `BLOCKING.REASON`, `EXPIRY.DATE`, `UNBLOCKING.CODE`, `UNBLOCKING.REASON`
    Bộ khóa/mở khóa account theo từng dòng multivalue.
  - `MANDATE.APPL`, `MANDATE.REG`, `MANDATE.RECORD`
    Bộ field liên kết mandate parameter, rule gateway và record mandate.
  - `REFERAL.CODE`, `INACTIVE.MONTHS`, `PASSBOOK`, `SHADOW.ACCOUNT`, `HVT.FLAG`, `EARLY.PROCESSING`, `ON.RESTRUCTURE`
    Nhóm cờ/bổ trợ nghiệp vụ riêng của account.

- Nhóm netting / bundle / link / limit
  - `BALANCE.TREATMENT`
    Cách xử lý balance trong netting, thấy các option `MEMO`, `PARTICIPATION`.
  - `LINK.AC.NUMBER`
    Account liên kết trong netting/balance treatment.
  - `BUNDLE.ARRANGEMENT`
    Arrangement bundle liên kết với account.
  - `PARENT.ACCOUNT`
    Parent account của quan hệ cover/control/netting.
  - `EXTERNAL.POSTING`, `MULTI.CURRENCY`
    Cờ cho phép external posting và đa tiền tệ.
  - `LIMIT.ACCOUNT`
    Cờ xác định account có tham gia link limit.
    `UPDATE.UPDATE.LIMIT.ACCOUNT` cho thấy nếu field này có giá trị thì routine gọi `AA.Framework.UpdateArrangementLimitLink(...)`.

- Nhóm IBAN / beneficiary / portfolio / APR
  - `GENERATE.IBAN`
    Nếu `YES`, `AA.ACCOUNT.UPDATE.GET.IBAN.NUMBER` sẽ gọi `AC.AccountOpening.AcGetIban(...)`.
  - `PORTFOLIO.ID`
    Portfolio id của arrangement/account, có checkfile động.
  - `BENEFICIARY`
    Beneficiary id trên account.
  - `APR.TYPE`, `APR.RATE`
    Bộ field lưu thông tin annual percentage rate để reporting.

### Action: UPDATE ACCOUNT

- File đã đọc: `AA.ACCOUNT.UPDATE.b`

- Kết luận đã chốt
  Đây là action tạo/sửa link account ở lớp condition và account details, không phải action trả tiền hay tạo bill.

- Các bước chính
  1. `PROCESS.INPUT.ACTION`
     Gán `PROCESS.TYPE = "UPDATE"`, tính lại `ANNIVERSARY`, rồi nếu là new arrangement hoặc activity class `UPDATE-LIMIT` thì chạy tiếp các bước dưới.
  2. `UPDATE.ANNIVERSARY.DATE`
     Gọi `AA.Account.DetermineAnniversaryDate(ARRANGEMENT.ID, EFFECTIVE.DATE, BASE.TYPE, ACTIVITY.ID, CURR.DATE, RETURN.DATE)`.
     Nếu có `RETURN.DATE` thì ghi lại `AcAnniversary` trên `R.NEW`.
  3. `UPDATE.ACCOUNT`
     - `GET.ACCOUNT.NUMBER`
       Nếu arrangement đã có linked application `ACCOUNT` thì lấy id từ `RArrangement`.
       Nếu chưa có thì lấy từ `AcAccountReference`; nếu field này có giá trị thì gọi `AA.Account.UpdateLinkApplication("ACCOUNT", ACCOUNT.NO, ...)` để gắn vào arrangement.
     - `GET.ALT.ACCT.ID`
       Gọi `AC.AccountOpening.AcGetAltAcctId(...)`, cập nhật lại `AcAltIdType` / `AcAltId` trên `R.NEW`, đồng thời raise lỗi theo từng position nếu duplicate/sai.
     - `GET.IBAN.NUMBER`
       Nếu app `IN` có cài và đây là new arrangement với `GENERATE.IBAN = YES`, gọi `AC.AccountOpening.AcGetIban(...)`, rồi ghi ngược `ALT.ID.TYPE` / `ALT.ID` cập nhật vào `R.NEW`.
  4. `UPDATE.ACCOUNT.DETAILS`
     Nếu là new arrangement thì gán `UPDATE.TYPE = "NEW"` rồi gọi `AA.PaymentSchedule.ProcessAccountDetails(ARRANGEMENT.ID, PROCESS.TYPE, UPDATE.TYPE, "", RET.ERROR)`.
     Routine này là nơi update `AA.ACCOUNT.DETAILS`, còn `AA.ACCOUNT.UPDATE.b` chỉ điều phối.
  5. `UPDATE.LIMIT.ACCOUNT`
     Nếu `LIMIT.ACCOUNT` có giá trị thì gọi `AA.Framework.UpdateArrangementLimitLink(ARRANGEMENT.ID, PROCESS.TYPE, "", "", RET.ERROR)`.
  6. `PROCESS.AUTHORISE.ACTION`
     Nếu đang `AUTH-REV` thì gọi `REMOVE.LIMIT.UPDATE`.
     Sau đó với new arrangement hoặc `UPDATE-LIMIT`, routine:
     - lấy account number,
     - gọi `CHECK.REFER.LIMIT`.
  7. `CHECK.REFER.LIMIT`
     Chỉ chạy cho product line `ACCOUNTS`.
     Routine đọc record `ACCOUNT`/`ACCOUNT$NAU`, rồi gọi `AA.Account.CheckReferLimitChange(...)`.
     Nếu cần update limit:
     - set `LinkToLimit = YES`,
     - gọi `CREATE.ACCOUNT.DEBIT.LIMIT`,
     - ghi lại record `ACCOUNT` hoặc `ACCOUNT$NAU`.
  8. `CREATE.ACCOUNT.DEBIT.LIMIT`
     Khi account chưa có `ACCOUNT.DEBIT.INT`, routine:
     - dựng `LIMIT.ID` từ liability/customer + `LIMIT.REF` hoặc `LIMIT.KEY`,
     - đọc record limit online,
     - nếu hợp lệ thì gọi `ADL.REC`.
  9. `ADL.REC`
     Tạo/cập nhật record `ACCOUNT.DEBIT.LIMIT` với id `ACCOUNT.NO-TODAY`, set các field:
     - `AdlLimit`
     - `AdlInputter`
     - `AdlDateTime`
     - `AdlCoCode`
     - `AdlCurrNo`
     - `AdlDeptCode`
     Đồng thời update ngày hôm nay vào field `AccDebLimit` trong record `ACCOUNT`.
  10. `REMOVE.LIMIT.UPDATE`
      Trong reversal auth, routine đọc lại `ACCOUNT.DEBIT.LIMIT` theo `ACCOUNT.NO-orig.system.date` rồi cập nhật `AdlLimit = 0`.

- File/bảng cập nhật thấy trực tiếp
  - `R.NEW` của property `ACCOUNT`
    - `AcAnniversary`
    - `AcAltIdType`
    - `AcAltId`
  - link application của arrangement
    qua `AA.Account.UpdateLinkApplication(...)`
  - `AA.ACCOUNT.DETAILS`
    qua `AA.PaymentSchedule.ProcessAccountDetails(...)`
  - `ACCOUNT` / `ACCOUNT$NAU`
    khi set `LinkToLimit = YES`
  - `ACCOUNT.DEBIT.LIMIT`
    qua `AC.AccountOpening.AccountDebitLimitWrite(...)`
  - arrangement limit link
    qua `AA.Framework.UpdateArrangementLimitLink(...)`

### Action: PAY ACCOUNT

- File đã đọc: `AA.ACCOUNT.PAY.b`

- Kết luận đã chốt bước đầu
  Đây là action accounting cho repayment của property `ACCOUNT` trong các activity `DEPOSITS-APPLYPAYMENT-PAYOUT.RULES` và `SAVINGS-APPLYPAYMENT-PAYOUT.RULES`.
  Routine không tự phân bổ payout rule; nó lấy bill đã được chọn, đọc amount của property trong `BILL.DETAILS`, xác định balance phải giảm/tăng (`CUR`, `UNC`, `AVL`, `ADVSUSPENSE`...), rồi raise accounting.

- Các bước chính đã chốt
  1. `SET.ACTIVITY.DETAILS`
     Lấy `REQD.PROCESS`, `ARR.ACTIVITY.ID`, `R.ACTIVITY`, `ACTIVITY.ACTION`, `ACTIVITY.DATE`, `ARRANGEMENT.ID`, arrangement currency.
  2. `PROCESS.INPUT.ACTION`
     - lấy danh sách bill cần xử lý,
     - lặp từng bill,
     - `GET.BILL.DETAILS`,
     - lấy `PROPERTY.REPAY.AMOUNT` từ `AA.PaymentSchedule.GetBillPropertyAmount("REPAY", ...)`,
     - xác định `PROPERTY.BALANCE` bằng `AA.ProductFramework.PropertyGetBalanceName(...)`,
     - dựng accounting event cho từng bill/property balance.
  3. `GET.BILL.DETAILS`
     Từ bill status trong `BILL.DETAILS`, routine suy ra `REPAY.STATUS` như `CUR`, `UNC`, `AVL`.
     Với `AVL`, routine ép `SUB.TYPE = BANK` để ra đúng balance name trên charged-off contract.
  4. `GET.PROPERTY.BALANCE`
     Gọi `PropertyGetBalanceName(ARRANGEMENT.ID, REPAY.PROPERTY, REPAY.STATUS, "", SUB.TYPE, PROPERTY.BALANCE)`.
  5. `BUILD.ACCOUNTING.UPDATES`
     Dựng `EVENT.REC` với:
     - `eventType`
     - `amount = PROPERTY.REPAY.AMOUNT`
     - `sign = DEBIT` mặc định
     - `balanceType = PROPERTY.BALANCE`
     - `valueDate = REPAYMENT.DATE`
     - `reversalInd`
     - `contraTarget = BAL*<suspense balance>`
     Nếu `REPAY.STATUS = AVL` thì đổi `sign = CREDIT` và xóa contra target.
  6. `GET.EVENT.TYPE`
     Gọi `AA.Accounting.GetAccountingEventType(...)` theo `REPAY.STATUS`.
     Additional info khác nhau cho:
     - `CUR`
     - `UNC`
     - `AVL`
     - `ADVSUSPENSE`
     và còn thêm `.OFFSET` nếu activity là `OFFSET` và offset accounting được setup `ITEMIZE`.
  7. `PROCESS.ACCOUNTING.UPDATES`
     Gọi `AA.Accounting.AccountingManager(...)`:
     - `VAL` thì đẩy `MULTI.EVENT.REC`,
     - mode khác thì gọi theo nhánh xóa/auth/reverse.

- Những gì đã thấy trực tiếp được update
  - accounting queue / accounting entries
    qua `AA.Accounting.AccountingManager(...)`
  - routine này chủ yếu đọc `AA.BILL.DETAILS`; chưa thấy nó tự ghi ngược bill trong phần đã đọc

### Action: MAKE.DUE ACCOUNT

- File đã đọc: `AA.ACCOUNT.MAKE.DUE.b`

- Kết luận đã chốt
  Đây là action make due principal cho `ACCOUNT` trong activity class `Lending-Makedue-PaymentSchedule`.
  Vai trò của nó là đọc bill đến hạn rồi raise accounting chuyển amount từ `CUR` sang `DUE`, hoặc từ `CUR` sang `PAY`, hoặc đẩy vào `AVL`/`EXP` tùy bill system type.

- Các bước chính
  1. `SET.ACTIVITY.DETAILS`
     Lấy `R.ACTIVITY.STATUS`, `ARR.ACTIVITY.ID`, `ACTIVITY.ACTION`, `EFFECTIVE.DATE`, `ARRANGEMENT.ID`, `CURRENT.ACTIVITY`, `AAA.ID`.
  2. `CHECK.CHARGEOFF.STATUS`
     Gọi `AA.ChargeOff.GetChargeoffDetails(...)`.
     Nếu contract charged off thì xử lý hai lượt `SUB.TYPE = BANK` và `CUST`, nếu không thì chỉ `BANK`.
  3. `PROCESS.INPUT.ACTION`
     - gán `REQD.PROCESS = "VAL"`,
     - lấy balance names `DUE`, `CUR`, `PAY`, `EXP`, `AVL`,
     - gọi `GET.BILL`,
     - gọi `CHECK.LAST.PAYMENT.DATE`,
     - lặp từng bill để dựng accounting.
  4. `GET.BILL`
     Gọi `AA.PaymentSchedule.GetBill(ARRANGEMENT.ID, '', EFFECTIVE.DATE, ...)` để lấy các bill của ngày đang make due.
  5. `GET.BILL.DETAILS`
     Đọc `BILL.DETAILS`, bỏ bill nếu:
     - `BdDueReference` không trùng `AAA.ID`,
     - đang xử lý subtype `CUST` nhưng payment method không phải `DUE`.
     Sau đó gọi `AA.PaymentSchedule.GetSysBillType(...)` để map bill type người dùng sang system bill type.
  6. `GET.DUE.AMOUNTS`
     Gọi `AA.PaymentSchedule.GetBillPropertyAmount("DUE", SUB.TYPE, PAYMENT.TYPE.LOC, PROPERTY, EFFECTIVE.DATE, BILL.DETAILS, PROPERTY.AMOUNT, "", RET.ERROR)`.
  7. `BUILD.ACCOUNTING.DETAILS`
     Chọn event type và cặp balance theo bill type:
     - `EXPECTED`: debit `EXP`, không có contra balance thực
     - `DISBURSEMENT` hoặc `TRANCHE`: payment method `PAY`, additional info `AVL`, debit `AVL`
     - bill payment method `DUE`: debit `DUE`, contra `CUR`
     - bill payment method `PAY`: debit `CUR`, contra `PAY`
  8. `BUILD.ACCOUNTING.UPDATES`
     Dựng `EVENT.REC`:
     - `eventType = DR.EVENT.TYPE`
     - `amount = PROPERTY.AMOUNT`
     - `sign = DEBIT`
     - `balanceType = DEBIT.BALANCE.TYPE`
     - `valueDate = BdFinancialDate`
     - `reversalInd`
     - `contraTarget = BAL*<CREDIT.BALANCE.TYPE>` nếu có contra
  9. `CHECK.LAST.PAYMENT.DATE`
     Nếu:
     - không có renewal date,
     - `EFFECTIVE.DATE = AdPaymentEndDate`,
     - product line là `LENDING`,
     - current activity không phải `MAKEDUE.DISBURSE` hoặc `TRANCHE.START`
     thì routine append secondary activity `LENDING-RESIDUAL-<property>` bằng `AA.Framework.SecondaryActivityManager("APPEND.TO.LIST", AAA.REC)`.
  10. `PROCESS.ACCOUNTING.UPDATES`
      Gọi `AA.Accounting.AccountingManager(...)` theo mode `VAL/DEL/AUT`.

- File/bảng cập nhật thấy trực tiếp
  - accounting queue / accounting entries
    qua `AA.Accounting.AccountingManager(...)`
  - secondary activity list
    qua `AA.Framework.SecondaryActivityManager(...)`
  - bill ở đây chủ yếu được đọc, không thấy ghi bill trực tiếp trong file này

### Action: REPAY ACCOUNT

- File đã đọc: `AA.ACCOUNT.REPAY.b`

- Kết luận đã chốt
  Đây là action thu nợ principal trong `LENDING-APPLYPAYMENT-PAYMENT.RULES`.
  So với `PAY ACCOUNT`, routine này sâu hơn vì:
  - lấy bill theo repayment reference của AAA hiện tại,
  - xử lý đúng theo bill status/aging status,
  - xử lý charge-off theo `CUST`/`BANK`/`CO`,
  - hỗ trợ invoice bill, advance repayment, offset, participant accounting.

- Các bước chính
  1. `SET.ACTIVITY.DETAILS`
     Lấy `REQD.PROCESS`, `ARR.ACTIVITY.ID`, `R.ACTIVITY`, `ACTIVITY.ACTION`, `ACTIVITY.DATE`, `ARRANGEMENT.ID`, arrangement currency.
  2. `CHECK.CHARGEOFF.STATUS`
     Nếu contract charged off thì xử lý ba lượt `SUB.TYPE = CUST`, `BANK`, `CO`; nếu không charged off thì chạy một lượt subtype rỗng.
  3. `INITIALISE`
     Reset biến cục bộ, lấy `REPAY.PROPERTY`, `REPAYMENT.DATE`, queue accounting, group id, amount LCY.
     Đồng thời gọi `GET.PARTICIPANT.FLAG` để biết có borrower participant entries hay không.
  4. `GET.REPAID.BILLS`
     Dựng `REPAYMENT.REFERENCE = ARR.ACTIVITY.ID : effective date`, rồi gọi `GET.BILL`.
     Nếu không có bill, thử lại với reference dạng `ARR.ACTIVITY.ID:ADVANCE:EFFECTIVE.DATE`; nếu có thì bật `ADVANCE.REPAY = 1` và ép `REPAY.STATUS = CUR`.
  5. `GET.BILL`
     Gọi `AA.PaymentSchedule.GetBill(..., REPAYMENT.REFERENCE:@FM:SUB.TYPE, BILL.REFERENCE, RET.ERROR)` để lấy đúng bill do activity hiện tại đã repay.
  6. Lặp từng bill trong `PROCESS.INPUT.ACTION`
     - reset `PROPERTY.REPAY.AMOUNT`,
     - đọc `R.BILL.DETAILS`,
     - lấy amount của property bằng `AA.PaymentSchedule.GetBillPropertyAmount("REPAY", SUB.TYPE, "", REPAY.PROPERTY, REPAYMENT.REFERENCE, R.BILL.DETAILS, ...)`,
     - xác định balance phải credit/debit,
     - build accounting entries.
  7. `GET.BILL.DETAILS`
     Nếu chưa có `REPAY.STATUS` trước đó thì routine suy ra từ:
     - `BdBillStatus`
     - `BdSettleStatus`
     - `BdAgingStatus`
     - `BdBillType`
     Nếu bill đang aging thì gọi `AA.Overdue.OverdueBalanceStatus(...)` để map sang balance status hiện hành.
     Nếu payment type có alternate payment method `CAP.AND.INV` thì gán `REPAY.STATUS = INV`.
     Nếu bill đã settled/repaid hoàn toàn, routine lùi về status cũ hơn để chọn đúng balance bị tác động.
  8. `CHECK.BALANCES.SETTLEMENT`
     Sau khi xử lý bill-level repayment, routine còn đọc `AA.ACTIVITY.BALANCES` theo `CUR` và `UNC` bằng:
     `AA.Framework.ProcessActivityBalances(ARRANGEMENT.ID, "GET", "", ARR.ACTIVITY.ID, REPAY.PROPERTY, PROPERTY.BALANCE, PROPERTY.REPAY.AMOUNT, RET.ERROR)`
     để raise thêm accounting cho current/uncleared balance đã settle trong activity.
  9. `GET.PROPERTY.BALANCE`
     Gọi `AA.ProductFramework.PropertyGetBalanceName(...)` với `REPAY.STATUS` để ra balance type thật.
  10. `BUILD.ACCOUNTING.UPDATES`
      Dựng `EVENT.REC` với:
      - `amount = ABS(PROPERTY.REPAY.AMOUNT)`
      - `sign = CREDIT` nếu amount dương, `DEBIT` nếu amount âm
      - `balanceType = PROPERTY.BALANCE`
      - `valueDate = REPAYMENT.DATE`
      - `reversalInd`
      - `contraTarget = BAL*AA.SUSPENSE` nếu subtype là rỗng hoặc `BANK` và không có participant
      Nếu `SUB.TYPE = CO`, routine còn dựng thêm `CO.EVENT.TYPE` để knock off suspense/P&L chargeoff bằng entry có `contraTarget = "CF"`.
  11. `GET.EVENT.TYPE`
      Chọn event type theo `REPAY.STATUS`:
      - `INV` dùng payment method `DUE` với additional info `INV`
      - `CUR` dùng payment method `DUE` với additional info `CUR`
      - `UNC` dùng payment method `PAY` với additional info `UNC`
      - còn lại dùng payment method `DUE` với additional info `OS`
      Nếu activity là `OFFSET` và offset accounting setup `ITEMIZE` thì thêm `.OFFSET`.
      Nếu subtype `CUST` hoặc `CO` và không phải `UNC`, event type còn được nối thêm hậu tố subtype.
      Riêng `SUB.TYPE = CUST/CO` với `REPAY.STATUS = UNC`, routine xóa luôn `PROPERTY.REPAY.AMOUNT` để không raise entry sai.
  12. `PROCESS.ACCOUNTING.UPDATES`
      Gọi `AA.Accounting.AccountingManager(ACCOUNTING.TYPE, REPAY.PROPERTY, ACTIVITY.ACTION, REPAYMENT.DATE, MULTI.EVENT.REC, RET.ERROR)`.
  13. `PARTICIPANTS.ACTION`
      Nếu có participant thì gọi `AA.Account.AccountRepayParticipant()` để raise borrower/book participant entries theo participant setup.

- File/bảng cập nhật thấy trực tiếp
  - accounting queue / accounting entries
    qua `AA.Accounting.AccountingManager(...)`
  - routine này đọc bill và activity balances để xác định amount; trong file đã đọc chưa thấy nó tự ghi trực tiếp `BILL.DETAILS`

---

## Property class: CHARGE

### Source đã đọc
- `T24.BP/AA.CHARGE.FIELDS.b`
- `T24.BP/AA.CHARGE.VALIDATE.b`
- `T24.BP/AA.CHARGE.MAKE.DUE.b`
- `T24.BP/AA.PROCESS.CHARGE.MAKE.DUE.b`
- `T24.BP/AA.CHARGE.REPAY.b`
- `T24.BP/AA.CHARGE.PAY.b`
- `T24.BP/AA.CHARGE.ACCRUE.b`
- `T24.BP/AA.CHARGE.CAPITALISE.b`

### Ghi nhận field chính bước đầu

- `CURRENCY`
  Tiền tệ của charge. `FIELDS` dùng kiểu `CCY`.
  Lịch sử sửa cho thấy hệ thống phải tôn trọng currency trên charge khi lấy amount field.

- `CHARGE.TYPE`
  Chọn charge `FIXED` hay `CALCULATED`.
  `VALIDATE` dùng field này để tách logic:
  - fixed charge thì lấy số tiền trực tiếp,
  - calculated charge thì phải có setup product designer/routine/tier đúng.

- `FIXED.AMOUNT`
  Số tiền charge cố định theo tiền tệ của property.

- `CHARGE.PERIOD`
  Kỳ charge, nhưng `NOINPUT` ở field definition; nhiều khả năng được engine tính/điền.

- `CALC.THRESHOLD`, `FREE.AMOUNT`
  Hai ngưỡng dùng cho calculated charge:
  - threshold để bắt đầu tính,
  - free amount để miễn một phần amount nguồn trước khi tính charge.

- `TIER.GROUPS`, `CALC.TIER.TYPE`, `CALC.TYPE`
  Bộ field xác định charge tính theo tier:
  - groups kiểu `BANDS` / `LEVELS`
  - tier type `BAND` / `LEVEL`
  - calc type `FLAT` / `PERCENTAGE` / `UNIT`

- `CHARGE.RATE`, `CHG.AMOUNT`, `TIER.MIN.CHARGE`, `TIER.MAX.CHARGE`, `TIER.AMOUNT`, `TIER.COUNT`, `TIER.TERM`, `TIER.EXCLUSIVE`
  Bộ field chi tiết của calculated charge:
  - rate trên mỗi tier,
  - amount charge tuyệt đối,
  - min/max charge,
  - ngưỡng amount/count/term,
  - cờ tier exclusive.

- `ROUNDING.RULE`
  Rule rounding sau khi tính charge.

- `CHARGE.ROUTINE`
  Hook/local routine tính charge.
  `FIELDS` định nghĩa kiểu `HOOKOTHER` với hook `HOOK.AA.CALCULATE.CHARGE`.
  `VALIDATE` cho thấy nếu accounting accrue flag là `ACCRUE` mà field này rỗng thì calculated charge sẽ bị chặn.

- `REFER.LIMIT`
  Cờ nối charge với property `LIMIT`.
  `VALIDATE` xác nhận: nếu bật field này thì:
  - product line phải là `ACCOUNTS`,
  - arrangement phải có property `LIMIT`,
  - `LIMIT` phải là single limit,
  - phải có `LIMIT.REFERENCE`,
  - phải có `LIMIT.SERIAL`.

- `MIN.CHG.AMOUNT`, `MIN.CHG.WAIVE`
  Bộ minimum charge tương tự minimum interest:
  - ngưỡng charge tối thiểu,
  - cờ waive phần chênh nếu charge thực tế thấp hơn minimum.

- `ACCRUAL.RULE`, `CANCEL.PERIOD`
  Bộ field cho charge amort/accrual.
  `VALIDATE` chốt rõ:
  - chỉ hợp lệ nếu property/accounting setup cho `ACCRUE` hoặc `AMORT`,
  - chỉ hợp lệ khi charge/property có trong accounting property setup,
  - `CANCEL.PERIOD` phải nhỏ hơn maturity date.

- `INTERNAL.BOOKING`
  Nếu bằng `YES`, `VALIDATE` bắt buộc accounting condition phải có đầy đủ các field internal booking/waiving tương ứng.

- `RELATIONSHIP.*`, `PROGRAM.LIMIT`, `PACKAGE.PRODUCT`, `PACKAGE.PROPERTY.CONTROL`, `REGIONAL.*`, `SUPPRESS`
  Đây là nhóm field pricing/package/regional/suppress của charge; hiện đã xác định được mục đích cấu hình nhưng chưa đọc sâu action tương ứng.

### Action: MAKE.DUE CHARGE

- File đã đọc: `AA.CHARGE.MAKE.DUE.b`

- Kết luận đã chốt
  File `AA.CHARGE.MAKE.DUE.b` không chứa logic make due chi tiết của charge ở cấp bill/property như `ACCOUNT` hay `INTEREST`.
  Nó là action wrapper:
  - lấy context activity,
  - xác định status,
  - gọi routine lõi `AA.Fees.ProcessChargeMakeDue(...)`,
  - đẩy accounting queue,
  - nếu có participants thì gọi `AA.Fees.ChargeMakeDueParticipant()`.

- Các bước chính từ source
  1. `SET.ACTIVITY.DETAILS`
     Lấy `R.ACTIVITY.STATUS`, `R.FULL.ACTIVITY.STATUS`, `ARR.ACTIVITY.ID`, `ACTIVITY.ACTION`, `EFFECTIVE.DATE`, `ARRANGEMENT.ID`, `MATURITY.DATE`.
  2. `INITIALISE`
     Reset `REQD.PROCESS`, `RET.ERROR`, `PROCESS.ERROR`, `MULTI.EVENT.REC`, `REVERSAL.MODE`, `PROPERTY`.
     Đồng thời gọi `GET.PARTICIPANTS.DETAILS`.
  3. `PROCESS.INPUT.ACTION`
     Nếu `REQD.PROCESS` chưa có thì gán `VAL`.
     Sau đó gọi:
     `AA.Fees.ProcessChargeMakeDue(ARRANGEMENT.ID, EFFECTIVE.DATE, ACTIVITY.ACTION, MATURITY.DATE, R.ACTIVITY.STATUS, R.FULL.ACTIVITY.STATUS, REVERSAL.MODE, PROPERTY, MULTI.EVENT.REC, PROCESS.ERROR)`
     Nếu `MULTI.EVENT.REC` có dữ liệu thì gọi `PROCESS.ACCOUNTING.UPDATES`.
  4. `PROCESS.DELETE.ACTION`
     Gán `REQD.PROCESS = DEL`, vẫn gọi lại `AA.Fees.ProcessChargeMakeDue(...)`, rồi xóa/auth queue accounting qua `PROCESS.ACCOUNTING.UPDATES`.
  5. `PROCESS.AUTHORISE.ACTION`
     Gán `REQD.PROCESS = AUT`, gọi `PROCESS.ACCOUNTING.UPDATES`.
  6. `PROCESS.REVERSE.ACTION`
     Gán `REVERSAL.MODE = YES`, rồi chạy lại `PROCESS.INPUT.ACTION`.
  7. `PROCESS.REVERSE.DELETE.ACTION`
     Gán `REQD.PROCESS = DEL`, rồi gọi lại `PROCESS.INPUT.ACTION`.
  8. `PROCESS.PARTICIPANTS.ACTION`
     Nếu `PARTICIPANTS.LIST` có dữ liệu thì gọi `AA.Fees.ChargeMakeDueParticipant()`.
  9. `PROCESS.ACCOUNTING.UPDATES`
     Gọi `AA.Accounting.AccountingManager(...)`:
     - `VAL`: đẩy `MULTI.EVENT.REC`
     - mode khác: xử lý delete/auth tương ứng

- File/bảng cập nhật thấy trực tiếp
  - accounting queue / accounting entries
    qua `AA.Accounting.AccountingManager(...)`
  - participant make-due processing
    qua `AA.Fees.ChargeMakeDueParticipant()`

- Điểm phải đọc tiếp để đạt mức báo cáo cuối
  - `AA.CHARGE.ACCRUE.b`
  - `AA.CHARGE.CAPITALISE.b`
  - nếu cần participant chi tiết hơn thì `AA.CHARGE.MAKE.DUE.PARTICIPANT.b`

### Action lõi: PROCESS.CHARGE.MAKE.DUE

- File đã đọc: `AA.PROCESS.CHARGE.MAKE.DUE.b`

- Kết luận đã chốt
  Đây mới là routine lõi của charge make due.
  Nó đọc bill, lấy amount của property charge, cộng waive nếu cần, lấy suspend amount, xác định có phải accrual/amort hay không, dựng accounting entries, update bill status khi charge bị adjust về 0, rồi handoff sang accrual/amort framework khi cần.

- Các bước chính
  1. `INITIALISE`
     Reset các biến:
     - `PROPERTY.AMOUNT`
     - `BILL.REFERENCE`
     - `ACCRUE.AMORT`
     - `EVENT.DATE`
     - `DEBIT.BALANCE.TYPE`
     - `SKIP.ACCRUAL`
     - `AAA.ID`
     - `ALT.CHARGE`
     - payoff/closure flags
     - participant details
  2. `GET.INT.BOOKING`
     Đọc record property `CHARGE` hiện hành để lấy:
     - `InternalBooking`
     - `AccrualRule`
  3. `CHECK.REQD.INFO`
     Chặn nếu thiếu `ARRANGEMENT.ID`, `EFFECTIVE.DATE`, `ACTIVITY.ACTION`, `PROPERTY` hoặc action không phải `MAKE.DUE`.
  4. `CHECK.CHARGEOFF.STATUS`
     Gọi `AA.ChargeOff.GetChargeoffDetails(...)`.
     Nếu contract full chargeoff thì xử lý ba subtype:
     - `BANK`
     - `CUST`
     - `CO`
  5. `PROCESS.BILLS`
     Với từng subtype:
     - lấy balance names `PAY`, `DUE`, `ACC`, `DEF`,
     - nếu subtype `CO` thì đọc `AA.CHARGE.DETAILS` trước,
     - lấy danh sách bill,
     - lặp từng bill để build accounting / amortisation handoff.
  6. `GET.BILL`
     Nếu closure/payoff trigger thì lấy bill từ `ExtractLastPaymentDates(...)`.
     Nếu không:
     - lấy non-deferred bill theo `EFFECTIVE.DATE`,
     - lấy deferred bill theo vị trí defer date.
     Payment method được chọn là cả `DUE` và `PAY`.
  7. `GET.BILL.DETAILS`
     Đọc `BILL.DETAILS`, bỏ bill nếu:
     - `BdDueReference` không trùng `AAA.ID` và không phải alternate charge,
     - hoặc defer bill có due reference khác activity hiện tại.
     Đồng thời set cờ `DEFER.RELATED.PROCESSING` theo `BdDeferDate`.
  8. `GET.DUE.AMOUNTS`
     - nếu subtype `CO` thì lấy `CO.AMOUNT` từ `AA.CHARGE.DETAILS`,
     - còn lại gọi `AA.PaymentSchedule.GetBillPropertyAmount("DUE", SUB.TYPE, "", PROPERTY, EFFECTIVE.DATE, BILL.DETAILS, PROPERTY.AMOUNT, "", RET.ERROR)`.
     Sau đó:
     - tìm property trong `BdPayProperty`,
     - nếu có `ChargeOverrideRoutine` và `PROPERTY.AMOUNT = 0` thì bật cờ `CHARGE.ADJUST.TO.ZERO`,
     - nếu payment method không phải `DUE` thì gọi `AA.Tax.GetTaxConsolidatedAmount(...)` để ra `CONSOLIDATED.AMOUNT` và `NET.ACCOUNTING`.
  9. `GET.WAIVE.AMOUNT`
     - với subtype `CO`: lấy `CO.WAIVE.AMOUNT` từ `AA.CHARGE.DETAILS`,
     - còn lại gọi `AA.PaymentSchedule.GetBillPropertyAmount("WAIVE", SUB.TYPE, "", PROPERTY, EFFECTIVE.DATE, BILL.DETAILS, WAIVE.PROPERTY.AMOUNT, "", RET.ERROR)`.
     Sau đó cộng `PROPERTY.AMOUNT = DUE.PROPERTY.AMOUNT + WAIVE.PROPERTY.AMOUNT`.
     Nếu có waive và `ACCRUE.AMORT = ACCRUE` thì gọi `AMORTISATION.HANDOFF` để reverse current-period accrual / handoff schedule mới.
  10. `GET.SUSPEND.AMOUNTS`
      Gọi `AA.PaymentSchedule.GetBillPropertyAmount("SUSPEND", SUB.TYPE, "", PROPERTY, EFFECTIVE.DATE, BILL.DETAILS, SUS.PROPERTY.AMOUNT, "", RET.ERROR)`.
  11. `CHECK.AMORT.SETTING`
      Gọi `AA.Fees.CheckAmortRequired(...)` để xác định `ACCRUE` hay `AMORT`.
      Nhưng nếu:
      - contract full chargeoff,
      - có participants,
      - hoặc `EFFECTIVE.DATE = MATURITY.DATE` và không phải `ACCRUE`
      thì routine hủy amortisation/accrual.
      Nếu `EFFECTIVE.DATE = ARR.START.DATE` và `ACCRUE` thì set `SKIP.ACCRUAL = 1`, và trong một số trường hợp settle/payoff còn gọi `AA.Framework.AccrualDetailsHandoff(..., "CANCEL", ...)`.
  12. `PROCESS.AMORTISATION`
      Rẽ nhánh như sau:
      - delete + có amount: chỉ kiểm tra/handoff để mark `EB.ACCRUAL` là reversed
      - có amount: build accounting updates, rồi nếu cần tách waive itemized thì build thêm
      - không còn amount nhưng property vẫn có trong bill và `ACCRUE`:
        gọi `AMORTISATION.HANDOFF` để reverse current period accrual
  13. `BUILD.ACCOUNTING.UPDATES`
      Đây là phần dựng accounting quan trọng nhất.
      Nó phân nhánh:
      - `DEF.CHG.OVR.METHOD = ITEMIZED`
        raise event waive riêng với `ADDITIONAL.INFO = WAIVE`, sign `CREDIT`, balance `DUE`, contra `WAIVE.CM` hoặc `INT.WAIVE.CM`
      - `ACCRUE/AMORT` và không skip
        raise event `ACCRUE` hoặc `AMORT` trên balance `ACC`, và nếu có suspend amount thì raise thêm entry `SP`
      - chỉ có suspend amount
        raise event `SP` vào balance due tương ứng
      - bill payment method `PAY`
        nếu subtype rỗng hoặc `BANK` thì raise tax accounting:
        - net mode: `BUILD.NET.TAX.ACCOUNTING.UPDATES`
        - itemized mode: `BUILD.ITEMIZED.TAX.ACCOUNTING.UPDATES`
      - còn lại
        raise make-due chuẩn:
        - `PAY.METHOD = DUE`
        - debit `DUE`
        - contra `CM` hoặc `INT.CM`
        - nếu defer thì contra `DEF`
        - nếu subtype `CO` trong defer thì bỏ contra DEF
      Sau block chính, nếu đang `ACCRUE/AMORT` và không có override-itemized thì gọi tiếp `AMORTISATION.HANDOFF`.
      Nếu `DEFER.RELATED.PROCESSING` thì routine còn dựng thêm entry trên `ACC` hoặc `DEFSP` để xóa/đối ứng defer entries.
  14. `UPDATE.BILL.STATUS`
      Nếu charge bị adjust về 0 trong make due thì routine:
      - gán `BILL.STATUS = SETTLED`
      - gán `SETTLE.STATUS = REPAID`
      - gọi `AA.PaymentSchedule.UpdateBillStatus(...)` cho cả hai status
      - ghi lại bill bằng `AA.PaymentSchedule.UpdateBillDetails(...)`
  15. `GET.CO.AMOUNTS`
      Với subtype `CO`, routine không đọc amount từ bill trực tiếp mà đọc `AA.CHARGE.DETAILS` theo:
      - `ChgDetPaymentDate`
      - `ChgDetBillId`
      để lấy:
      - `ChgDetAmount`
      - `ChgDetWaiveAmount`
  16. `AMORTISATION.HANDOFF`
      Handoff sang accrual framework bằng `AA.Framework.AccrualDetailsHandoff(...)`.
      Tùy tình huống, `AMORT.TYPE` có thể là:
      - `CANCEL`
      - `NEW`
      - `AMOUNT.CHANGE`
      Đồng thời routine còn gọi `AA.Fees.GetScheduledChargeDetails(...)` để lấy `PAYMENT.END.DATE` và `PROP.AMT` cho handoff.

- File/bảng cập nhật thấy trực tiếp
  - `BILL.DETAILS`
    qua `AA.PaymentSchedule.UpdateBillStatus(...)` và `AA.PaymentSchedule.UpdateBillDetails(...)`
  - `AA.CHARGE.DETAILS`
    được đọc qua `AA.ActivityCharges.ProcessChargeDetails(...)` và `AA.Framework.getChargeDetails()`
  - framework accrual/amort handoff
    qua `AA.Framework.AccrualDetailsHandoff(...)`
  - accounting queue / accounting entries
    qua `AA.Accounting.BuildEventRec(...)` rồi về `AA.Accounting.AccountingManager(...)`

### Action: REPAY CHARGE

- File đã đọc: `AA.CHARGE.REPAY.b`

- Kết luận đã chốt
  `AA.CHARGE.REPAY.b` là wrapper mỏng hơn `ACCOUNT.REPAY`.
  Logic chi tiết repay bill được đẩy sang `AA.PaymentSchedule.ProcessRepayBills(...)`.
  File này chủ yếu:
  - lấy context AAA,
  - gọi routine repay bills,
  - gửi queue accounting,
  - nếu có participants thì gọi `AA.Fees.ChargeRepayParticipant()`.

- Các bước chính
  1. `SET.ACTIVITY.DETAILS`
     Lấy `REQD.PROCESS`, `ARR.ACTIVITY.ID`, `ACTIVITY.ACTION`, `ACTIVITY.DATE`, `ARRANGEMENT.ID`, arrangement currency.
  2. `INITIALISE`
     Reset error flags, `REPAY.PROPERTY`, `REPAYMENT.DATE`, `MULTI.EVENT.REC`, `REVERSAL.MODE`, participant data.
  3. `PROCESS.INPUT.ACTION`
     Gán `REQD.PROCESS = VAL`, rồi gọi:
     `AA.PaymentSchedule.ProcessRepayBills(ARRANGEMENT.ID, ACTIVITY.DATE, ARR.CCY, ACTIVITY.ACTION, ARR.ACTIVITY.ID, REVERSAL.MODE, REPAY.PROPERTY, REPAYMENT.DATE, MULTI.EVENT.REC, PROCESS.ERROR)`
     Nếu `MULTI.EVENT.REC` có dữ liệu thì gọi `AA.Accounting.AccountingManager(...)`.
  4. `PROCESS.DELETE/AUTH/REVERSE`
     - delete: `REQD.PROCESS = DEL`
     - auth: `REQD.PROCESS = AUT`
     - reverse: `REVERSAL.MODE = YES` rồi chạy lại input
  5. `PROCESS.PARTICIPANTS.ACTION`
     Nếu có participant thì gọi `AA.Fees.ChargeRepayParticipant()`.

- File/bảng cập nhật thấy trực tiếp
  - accounting queue / accounting entries
    qua `AA.Accounting.AccountingManager(...)`
  - participant repay processing
    qua `AA.Fees.ChargeRepayParticipant()`

### Action: PAY CHARGE

- File đã đọc: `AA.CHARGE.PAY.b`

- Kết luận đã chốt
  `PAY CHARGE` là payout-side action cho deposits/savings.
  So với `CHARGE.REPAY`, file này tự đọc bill `PAY` và tự build accounting entries trực tiếp, không đi qua `ProcessRepayBills`.

- Các bước chính
  1. `GET.REPAID.BILLS`
     Dùng `REPAYMENT.REFERENCE = ARR.ACTIVITY.ID : EFFECTIVE.DATE` để gọi `AA.PaymentSchedule.GetBill(...)`.
  2. Lặp bill trong `PROCESS.INPUT.ACTION`
     - đọc `BILL.DETAILS`,
     - chỉ giữ bill có `BdPaymentMethod = PAY`,
     - lấy amount của property bằng `AA.PaymentSchedule.GetBillPropertyAmount("REPAY", "", "", REPAY.PROPERTY, REPAYMENT.DATE, R.BILL.DETAILS, PROPERTY.REPAY.AMOUNT, PROPERTY.REPAY.AMOUNT.LCY, RET.ERROR)`,
     - xác định `PROPERTY.BALANCE` bằng `AA.ProductFramework.PropertyGetBalanceName(...)`,
     - dựng event accounting.
  3. `GET.PROPERTY.AMOUNT`
     Nếu payment method không phải `DUE`, routine gọi `AA.Tax.GetTaxConsolidatedAmount(...)`.
     Nếu `NET.ACCOUNTING` thì thay `PROPERTY.REPAY.AMOUNT` bằng `CONSOLIDATED.AMOUNT`.
  4. `BUILD.ACCOUNTING.UPDATES`
     Gọi `AA.Accounting.GetAccountingEventType(..., "PAY", ADDITIONAL.INFO, EVENT.TYPE, ...)`.
     Dựng `EVENT.REC`:
     - `amount += PROPERTY.REPAY.AMOUNT`
     - `sign = DEBIT`
     - `balanceType = PROPERTY.BALANCE`
     - `valueDate = REPAYMENT.DATE`
     - `contraTarget = BAL*AA.SUSPENSE`
     Nếu là offset transaction và offset accounting setup `ITEMIZE` thì `ADDITIONAL.INFO = OFFSET`.
  5. `PROCESS.ACCOUNTING_UPDATES`
     Gọi `AA.Accounting.AccountingManager(...)` theo mode `VAL/DEL/AUT/REVERSE`.

- File/bảng cập nhật thấy trực tiếp
  - accounting queue / accounting entries
    qua `AA.Accounting.AccountingManager(...)`
  - routine này đọc `BILL.DETAILS`, không thấy ghi bill trực tiếp trong file đã đọc

### Action: ACCRUE CHARGE

- File đã đọc: `AA.CHARGE.ACCRUE.b`

- Kết luận đã chốt
  `AA.CHARGE.ACCRUE.b` không tự tính công thức accrual của charge.
  Vai trò thật của nó là:
  - kiểm tra có cần đóng sớm amortisation khi `APPLYPAYMENT` đã tất toán hết các due khác hay không,
  - handoff thay đổi đó sang framework accrual,
  - nạp danh sách `EB.ACCRUAL` của arrangement,
  - chỉ chọn các `EB.ACCRUAL` thuộc đúng property charge hiện tại,
  - rồi gọi engine chung `AC.Fees.EbCommAccrual(...)`.

- Các bước chính
  1. `SET.ACTIVITY.DETAILS`
     Lấy `R.ACTIVITY.STATUS`, `R.ACTIVITY.FULL.STATUS`, `ARR.ACTIVITY.ID`, `ACTIVITY.ACTION`, `EFFECTIVE.DATE`, `ARRANGEMENT.ID`, `PROPERTY.CLASS`, `PROPERTY`, `ACTIVITY.ID`, `THIS.ACTIVITY`, `MASTER.ACT.CLASS`.
  2. `INITIALISE`
     Reset `RET.ERROR`, `PROCESS.ERROR`, `DUES.SETTLED`, `IS.APPLYPAYMENT`, `AMORT.TYPE`, `PROCESS.TYPE`.
  3. `PROCESS.INPUT.ACTION`
     Gọi `CHECK.TO.CLOSE.AMORTISATION`.
     Nếu `DUES.SETTLED<3> = 1` thì:
     - gán `AMORT.TYPE = "CLOSE.AMORT"`
     - gán `PAYMENT.DATE = EFFECTIVE.DATE`
     - gọi `AA.Framework.AccrualDetailsHandoff(ARRANGEMENT.ID, PROCESS.TYPE, AMORT.TYPE, PROPERTY, PAYMENT.DATE, "", "", "", "", "", PAYMENT.DATE, RETURN.ERROR)`
     Mục đích là đóng phần amortisation của charge tại ngày trả thực tế.
  4. `CHECK.TO.CLOSE.AMORTISATION`
     Chỉ chạy khi activity hiện tại là `APPLYPAYMENT` và activity này là master AAA.
     Routine đọc property `CLOSURE` bằng `AA.ProductFramework.GetPropertyRecord(...)`.
     Nếu:
     - `ClosureMethod = AUTOMATIC`
     - `ClosureType = BALANCE`
     thì gọi `AA.Closure.DetermineDueAmount(...)` để xác định `DUES.SETTLED`.
  5. `PROCESS.AUTHORISE.ACTION`
     Không tự tính accrual trong file này mà chuyển sang `PROCESS.EB.ACCRUAL`.
  6. `PROCESS.DELETE.ACTION`
     - gán `PROCESS.TYPE = "REVERSE"`
     - gọi lại `PROCESS.INPUT.ACTION` để restore payment end date trong `EB.ACCRUAL`
     - sau đó gọi `PROCESS.EB.ACCRUAL` để re-accrue vì dữ liệu accrual đã bị clear ở bước input của apply payment.
  7. `PROCESS.REVERSE.ACTION`
     Gán `PROCESS.TYPE = "REVERSE"` rồi chạy lại `PROCESS.INPUT.ACTION`.
  8. `PROCESS.EB.ACCRUAL`
     Nếu `THIS.ACTIVITY = APPLYPAYMENT` hoặc full status là `AUTH-REV` hay `DELETE` thì routine kiểm tra lại `CHECK.TO.CLOSE.AMORTISATION`.
     Chỉ khi `DUES.SETTLED<3>` có giá trị thì mới:
     - nạp môi trường `EB.COMM.ACCRUAL.LOAD`
     - gọi `PROCESS.AMORT`
     Với các case bình thường, routine luôn:
     - `EB.COMM.ACCRUAL.LOAD`
     - `PROCESS.AMORT`
  9. `EB.COMM.ACCRUAL.LOAD`
     Mở các file:
     - `F.EB.ACCRUAL`
     - `F.ACCOUNT.CLOSED`
     Đồng thời set các common variable dùng cho `EB.COMM.ACCRUAL`:
     - `EOD`
     - `EOM`
     - `ACCRUE.TO.DATE`
     theo `EFFECTIVE.DATE` và batch start date.
  10. `PROCESS.AMORT`
      Đọc `R.EB.ACCRUAL.CONCAT = AC.Fees.EbAccrualConcat.Read(ARRANGEMENT.ID, ...)`.
      Nếu master activity class là `RECOGNIZE-PRODUCT.COMMISSION` thì lọc lại danh sách accrual id qua `FILTER.EB.ACCRUAL.ID`.
      Sau đó lặp từng `EB.ACCRUAL.ID`:
      - đọc record `R.EB.ACCRUAL = AC.Fees.EbAccrual.Read(...)`
      - xác định property charge từ `EbAccChargeNo`; file này hỗ trợ cả format id cũ và mới
      - chỉ xử lý record có property trùng `PROPERTY` hiện tại
      - nếu `EbAccAction = "R"` thì luôn gọi `AC.Fees.EbCommAccrual(EB.ACCRUAL.ID)`
      - nếu không, chỉ gọi `AC.Fees.EbCommAccrual(...)` khi `EbAccAccrToDate` còn rỗng hoặc nhỏ hơn `EFFECTIVE.DATE`
      Điều này tránh chạy lại accrual trên record đã accrue tới ngày hiện tại hoặc xa hơn.

- File/bảng cập nhật thấy trực tiếp
  - `EB.ACCRUAL`
    được đọc trực tiếp và được engine `AC.Fees.EbCommAccrual(...)` xử lý tiếp
  - `EB.ACCRUAL.CONCAT`
    đọc để lấy toàn bộ `EB.ACCRUAL.ID` theo arrangement
  - `ACCOUNT.CLOSED`
    được mở trong `EB.COMM.ACCRUAL.LOAD`
  - framework accrual handoff
    qua `AA.Framework.AccrualDetailsHandoff(...)`

### Action: CAPITALISE CHARGE

- File đã đọc: `AA.CHARGE.CAPITALISE.b`

- Kết luận đã chốt
  Đây là action dùng trong `Lending-Capitalise-PaymentSchedule`.
  Logic thật của nó không chỉ là "capitalise charge" một cách chung chung, mà gồm đủ các bước:
  - lấy balance type nguồn và đích,
  - lấy bill `CAPITALISE` và cả bill `DUE` khi payment type có alternate method `CAP.AND.INV`,
  - lấy amount/waive/suspend của đúng property charge,
  - xác định có phải accrual hay amortisation không,
  - dựng accounting entries cho `CUR`, `CAP`, `ACC`, `DEF`, `INV`, `SP`,
  - cập nhật payoff details khi activity là payoff/closure,
  - handoff sang `EB.ACCRUAL` khi charge đang accrue/amort.

- Các bước chính
  1. `SET.ACTIVITY.DETAILS`
     Lấy `R.ACTIVITY.STATUS`, `R.FULL.ACTIVITY.STATUS`, `ARR.ACTIVITY.ID`, `ACTIVITY.ACTION`, `EFFECTIVE.DATE`, `ARRANGEMENT.ID`, `MASTER.ACT.CLASS`, `MASTER.ACTIVITY.NAME`.
     Routine cũng tự xác định:
     - có phải payoff/closure hay không,
     - `AAA.ID = AA.Framework.getTxnReference()`,
     - `PRODUCT.LINE`,
     - `CHARGE.PROP`,
     - `ALT.CHARGE`.
  2. `CHECK.CHARGEOFF.STATUS`
     Gọi `AA.ChargeOff.GetChargeoffDetails(...)`.
     Nếu arrangement full chargeoff thì routine chạy lần lượt ba subtype:
     - `BANK`
     - `CUST`
     - `CO`
  3. `INITIALISE`
     Reset:
     - `REQD.PROCESS`
     - `RET.ERROR`
     - `PROCESS.ERROR`
     - `MULTI.EVENT.REC`
     - `REVERSAL.MODE`
     - `EVENT.DATE`
     - `PROPERTY.AMOUNT`
     - `ACCRUE.AMORT`
     - `SKIP.ACCRUAL`
     Đồng thời đọc `F.AA.PROPERTY`; nếu property type chứa `CREDIT` thì đổi `SIGN` từ `DEBIT` sang `CREDIT`.
     Routine cũng nạp participant details bằng `AA.Participant.GetParticipantsCommon(...)`.
  4. `GET.INT.BOOKING`
     Đọc property record `CHARGE` để lấy:
     - `InternalBooking`
     - `AccrualRule`
  5. `GET.BALANCE.TYPES`
     Xác định rõ các balance type dùng để capitalise:
     - `DEF.BALANCE.TYPE`: balance `DEF` của charge property
     - `DEBIT.BALANCE.TYPE`: balance `CUR` của property `ACCOUNT`/principal
     - `AMORT.BALANCE.TYPE`: balance `ACC` của charge
     - `INV.BALANCE.TYPE`: balance `INV`, riêng subtype `CO` thì dùng `DUE`
     - `CAP.BALANCE.TYPE`: balance `CAP` của charge
  6. `GET.CHARGE.DETAILS`
     Với subtype `CO`, routine nạp `AA.CHARGE.DETAILS` bằng `AA.ActivityCharges.ProcessChargeDetails(...)`.
  7. `GET.BILL`
     Lấy danh sách bill theo nhiều nhánh:
     - nếu closure/payoff trigger thì dùng `AA.PaymentSchedule.ExtractLastPaymentDates(...)` rồi lấy bill `CAPITALISE` từ mốc payment date gần nhất
     - nếu không thì lấy:
       - bill `CAPITALISE` non-deferred theo `EFFECTIVE.DATE`
       - bill `CAPITALISE` deferred theo `DEFER.DATE`
       - bill `DUE` non-deferred
       - bill `DUE` deferred
     Việc lấy thêm `DUE` bill là để hỗ trợ payment type có alternate payment method `CAP.AND.INV`.
  8. `GET.BILL.DETAILS`
     Đọc `BILL.DETAILS` cho từng bill và loại bỏ bill không hợp lệ nếu:
     - `BdDueReference` khác `AAA.ID` và không phải alternate charge,
     - bill không chứa property hiện tại trong `BdProperty`,
     - bill có payment method `DUE` nhưng payment type không có alternate method `CAP.AND.INV`
     Routine cũng set cờ `DEFER.RELATED.PROCESSING` nếu `BdDeferDate` có dữ liệu.
  9. `GET.CO.AMOUNTS`
     Với subtype `CO`, routine không lấy capitalise amount từ bill chuẩn mà đọc từ `AA.CHARGE.DETAILS` theo:
     - `ChgDetPaymentDate`
     - `ChgDetBillId`
     để ra:
     - `CO.AMOUNT`
     - `CO.WAIVE.AMOUNT`
  10. `GET.DUE.AMOUNTS`
      Chọn `PROCESS.TYPE` theo đúng ngữ cảnh:
      - `CAPITALISE`
      - `DEFER.CAPITALISE`
      - `CAP.REPAY`
      - `DUE` khi đang raise thêm due/invoice entries cho `CAP.AND.INV`
      Sau đó routine quét `BdPayProperty`.
      Nếu payment method của dòng property là `CAPITALISE`, hoặc là `DUE` trong case `CAP.AND.INV`, thì:
      - với subtype `CO`: lấy trực tiếp `CO.AMOUNT`
      - còn lại: gọi `AA.PaymentSchedule.GetBillPropertyAmount(PROCESS.TYPE, SUB.TYPE, "", PROPERTY, CAP.DATE, BILL.DETAILS, PROPERTY.AMOUNT, "", RET.ERROR)`
      Rồi gọi `PROCESS.WAIVE.AMOUNT` để trừ phần waive ra khỏi amount capitalise.
      Cuối bước này routine còn gọi `AA.Tax.GetTaxConsolidatedAmount(...)` để xác định:
      - `CONSOLIDATED.AMOUNT`
      - `NET.ACCOUNTING`
  11. `GET.WAIVE.AMOUNT`
      Đọc thêm amount waive riêng bằng `AA.PaymentSchedule.GetBillPropertyAmount("WAIVE", ...)`.
      Nếu có waive thì:
      - gọi `CHECK.AMORT.SETTING`
      - nếu `ACCRUE.AMORT = ACCRUE` thì gọi `AMORTISATION.HANDOFF`
      Mục đích là reverse phần accrual của current period rồi handoff schedule mới.
  12. `PROCESS.BILLS`
      Đây là nhánh điều phối chính cho từng bill:
      - lấy due amount
      - nếu không phải defer thì lấy override method của charge
      - xử lý waive
      - nếu `DEF.CHG.OVR.METHOD = ITEMIZED` thì giữ `PROPERTY.AMOUNT = WAIVE.PROPERTY.AMOUNT` để raise waive entries riêng
      - nếu không itemized và đã waive thì đưa `PROPERTY.AMOUNT = 0`
      - kiểm tra amort/accrual bằng `CHECK.AMORT.SETTING`
      - nếu còn amount thì:
        - lấy suspend amount
        - build accounting entries
        - kiểm tra split waive entries
        - nếu là payoff thì gọi `AA.PaymentSchedule.UpdatePayoffDetails(...)`
      - nếu amount đã về 0 nhưng property vẫn còn trong bill và đang `ACCRUE` thì gọi `AMORTISATION.HANDOFF` để reverse current period accrual
  13. `CHECK.AMORT.SETTING`
      Gọi `AA.Fees.CheckAmortRequired(...)` để xác định `ACCRUE` hay `AMORT`, nhưng có các ngoại lệ:
      - full chargeoff thì không dùng accrue/amort
      - có participants thì borrower path không chạy accrue/amort
      - nếu `EFFECTIVE.DATE = ARR.START.DATE` và `ACCRUE`, routine set `SKIP.ACCRUAL = 1`
      - riêng settle payoff với end-day-inclusive thì còn gọi `AA.Framework.AccrualDetailsHandoff(..., "CANCEL", ...)`
  14. `BUILD.ACCOUNTING.UPDATES`
      Đây là đoạn dựng hạch toán chi tiết nhất của routine.
      Các nhánh chính:
      - waive itemized:
        - `ADDITIONAL.INFO = WAIVE`
        - `PAY.METHOD = DUE`
        - sign `CREDIT`
        - contra target `WAIVE.CM` hoặc `INT.WAIVE.CM`
      - accrual/amort:
        - event `ACCRUE` hoặc `AMORT`
        - amount đi vào `DEBIT.BALANCE.TYPE`
        - contra target là `BAL*ACC...` hoặc `BAL*DEF...`
        - nếu có suspend amount thì dựng thêm event `SP` bằng `AA.Accounting.BuildEventRec(...)`
      - charge có `SIGN = CREDIT`:
        - xử lý theo nhánh `PAY`
        - nếu tax setup là net thì gọi `BUILD.NET.ACCOUNTING.UPDATES`
        - nếu không thì gọi `BUILD.ITEMIZED.ACCOUNTING.UPDATES`
      - case `CAP.AND.INV` có suspend:
        - raise event `SP` trên `DUE`
      - due charge chuẩn:
        - `PAY.METHOD = DUE`
        - sign theo `SIGN`
        - nếu defer thì contra `BAL*DEF...`
        - nếu internal booking thì contra `INT.CM`
        - nếu `ACCOUNTS` product line và có suspend amount thì contra `BAL*CAP...SP`
        - còn lại contra `CM`
      Sau block chính:
      - nếu `ACCRUE.AMORT` có giá trị thì gọi `AMORTISATION.HANDOFF`
      - nếu không accrue/amort nhưng là defer bill thì routine dựng thêm một entry nữa trên `AMORT.BALANCE.TYPE` để đưa phần deferred charge về P/L.
  15. `CHECK.SPLIT.WAIVE.ENTRIES`
      Nếu consolidation method là `ITEMIZED` và có waive amount thì routine gọi lại `BUILD.ACCOUNTING.UPDATES` để raise thêm waive entries tách riêng.
  16. `UPDATE.PAYOFF.DETAILS`
      Trong payoff path, nếu không có waive thì routine cập nhật payoff bill:
      - `PAYOFF$INV.DUE` khi đang xử lý nhánh `CAP.AND.INV` và raise due entries
      - `PAYOFF$CURRENT` khi sign là debit
      - `PAYOFF$PAY.CURRENT` khi sign là credit
      Lời gọi thực tế là `AA.PaymentSchedule.UpdatePayoffDetails(...)`.
  17. `AMORTISATION.HANDOFF`
      Routine xác định:
      - `CANCEL.PERIOD`
      - `PAYMENT.END.DATE`
      - `BILL.REF`
      - `AMORT.START.DATE`
      - `PROP.AMT`
      Nếu đang `ACCRUE` ở trạng thái `UNAUTH` và không phải defer:
      - waive hoặc property bị adjust về 0 thì `AMORT.TYPE = CANCEL`
      - alternate charge thì `AMORT.TYPE = NEW`
      - còn lại `AMORT.TYPE = AMOUNT.CHANGE`
        và gọi `AA.Fees.GetScheduledChargeDetails(...)` để lấy amount đã capture trong current period rồi trừ khỏi `PROP.AMT`
      Sau đó routine gọi `AA.Framework.AccrualDetailsHandoff(...)`.
      Ở các case khác, nó vẫn handoff kiểu `NEW`, có thể truyền thêm `BILL.REF` và `AMORT.START.DATE`.
  18. `PROCESS.ACCOUNTING.UPDATES`
      Với `REQD.PROCESS = VAL`, nếu có `MULTI.EVENT.REC` thì gọi:
      `AA.Accounting.AccountingManager(REQD.PROCESS, PROPERTY, ACTIVITY.ACTION, "", MULTI.EVENT.REC, RET.ERROR)`
      Với `DEL/AUT`, routine gọi `AccountingManager` ở mode tương ứng để xóa hoặc authorise.
  19. `PROCESS.PARTICIPANT.ACTION`
      Nếu có participant, borrower path gọi tiếp `AA.Fees.ChargeCapitaliseParticipant()`.

- File/bảng cập nhật thấy trực tiếp
  - `BILL.DETAILS`
    được đọc để lấy payment method, due reference, defer date, property list và amount
  - `AA.CHARGE.DETAILS`
    được đọc khi subtype là `CO`
  - payoff details
    qua `AA.PaymentSchedule.UpdatePayoffDetails(...)`
  - framework accrual/amort handoff
    qua `AA.Framework.AccrualDetailsHandoff(...)`
  - accounting queue / accounting entries
    qua `AA.Accounting.BuildEventRec(...)` và `AA.Accounting.AccountingManager(...)`

---

## Property class: PAYMENT.SCHEDULE

### Source đang đọc
- `T24.BP/AA.PAYMENT.SCHEDULE.FIELDS.b`
- `T24.BP/AA.PAYMENT.SCHEDULE.UPDATE.b`
- `T24.BP/AA.PAYMENT.SCHEDULE.MAKE.DUE.b`
- `T24.BP/AA.PAYMENT.SCHEDULE.CAPITALISE.b`

### Ghi nhận bước đầu đã chốt

- `AA.PAYMENT.SCHEDULE.UPDATE.b`
  Đây chỉ là wrapper.
  Routine chỉ:
  - lấy context activity,
  - gọi `AA.PaymentSchedule.PaymentScheduleManager("UPDATE" / "DELETE" / "AUTHORISE", RET.ERROR)`,
  - nếu không lỗi thì gọi `AA.Framework.UpdateChangeCondition()`.
  Vì vậy logic tạo/cycle schedule, build amount, update `AA.SCHEDULED.ACTIVITY` không nằm trong file này mà nằm trong `PaymentScheduleManager` và các action nghiệp vụ `MAKE.DUE` / `CAPITALISE`.

- `AA.PAYMENT.SCHEDULE.MAKE.DUE.b`
  Đã chốt được trục xử lý chính:
  - `PROCESS.TYPE = UPDATE`
  - lấy `LAST.PAYMENT.DATE`
  - `RECALCULATE.DUE.AMOUNTS`
  - `PROCESS.ISSUE.BILL`
  - nếu không phải handoff-charge thì vào `PROCESS.INPUT.ACTION.FINANCIAL`
  Trong nhánh financial, routine:
  - lấy bill references,
  - lặp từng bill,
  - đọc `BILL.DETAILS`,
  - lấy due amounts,
  - lấy payment dates / actual dates / financial date,
  - update `BILL.DETAILS`,
  - update bill status,
  - update processed payment details trong `AA.ACCOUNT.DETAILS`,
  - update settlement status,
  - ghi bill lại,
  - tạo bill-wise interest accrual bằng `AA.Interest.CreateBillInterestAccruals(...)`,
  - gọi `AA.PaymentSchedule.ChargeAccrualHandoff(...)`,
  - cycle next schedule details và `AA.SCHEDULED.ACTIVITY` nếu không phải closure/interim case.

- `AA.PAYMENT.SCHEDULE.CAPITALISE.b`
  Đã chốt được trục xử lý chính:
  - `PROCESS.TYPE = UPDATE`
  - lấy `LAST.PAYMENT.DATE`
  - kiểm tra projected bill online capitalise
  - `RECALCULATE.DUE.AMOUNTS`
  - `PROCESS.ISSUE.BILL`
  - nếu không handoff charge thì vào nhánh financial bill
  Routine này xử lý:
  - bill `CAPITALISE`, và một số case cả bill `DUE`,
  - projected bill / online capitalise,
  - interim capitalisation / adjust cap,
  - payoff/closure,
  - reverse bill details, payment details, settlement status ở nhánh delete/reverse,
  - charge accrual handoff,
  - update next schedule và `AA.SCHEDULED.ACTIVITY`.

### Việc còn đọc tiếp ngay sau note này

- `PAYMENT.SCHEDULE.FIELDS`
  cần chốt từng field theo nhóm start/end date, payment type, payment method, bill type, percentage, progressive payment, deferment, holiday, online capitalise, base day.
- `PAYMENT.SCHEDULE.MAKE.DUE`
  cần đọc sâu các label:
  - `GET.BILL`
  - `GET.BILL.DETAILS`
  - `GET.DUE.AMOUNTS`
  - `UPDATE.BILL.DETAILS`
  - `UPDATE.BILL.STATUS`
  - `UPDATE.PAYMENT.DETAILS`
  - `UPDATE.AA.SCHEDULED.ACTIVITY`
- `PAYMENT.SCHEDULE.CAPITALISE`
  cần đọc sâu cùng nhóm label tương ứng và phần projected bill / cap.and.inv / update cap amount.
