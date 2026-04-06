# Ghi chú đọc lại property từ source

File này thay thế hướng đọc dựa trên data web cũ.

Nguyên tắc:
- Chỉ ghi điều đã thấy trực tiếp trong `T24.BP`.
- Với field, chỉ mô tả ý nghĩa khi đã thấy field đó được định nghĩa hoặc được dùng trong `VALIDATE` / `UPDATE` / action liên quan.
- Với action, phải lần đến routine lõi và ghi rõ đọc bảng nào, update bảng nào, field/biến nào được dùng.
- Chỉ khi property đủ chắc mới được bơm sang data website.

## Nhóm lõi sẽ đọc lại trước

1. `ACCOUNT`
2. `INTEREST`
3. `CHARGE`
4. `PAYMENT.SCHEDULE`
5. `SETTLEMENT`
6. `PAYMENT.RULES`
7. `PERIODIC.CHARGES`
8. `BALANCE.AVAILABILITY`
9. `BALANCE.MAINTENANCE`

## Danh sách routine gốc đã khóa lại cho nhóm lõi

### ACCOUNT
- `T24.BP/AA.ACCOUNT.FIELDS.b`
- `T24.BP/AA.ACCOUNT.VALIDATE.b`
- `T24.BP/AA.ACCOUNT.UPDATE.b`
- `T24.BP/AA.ACCOUNT.MAKE.DUE.b`
- `T24.BP/AA.ACCOUNT.REPAY.b`

### INTEREST
- `T24.BP/AA.INTEREST.FIELDS.b`
- `T24.BP/AA.INTEREST.VALIDATE.b`
- `T24.BP/AA.INTEREST.UPDATE.b`
- `T24.BP/AA.INTEREST.ACCRUE.b`
- `T24.BP/AA.INTEREST.MAKE.DUE.b`
- `T24.BP/AA.INTEREST.CAPITALISE.b`
- `T24.BP/AA.ACCRUE.INTEREST.b`

### CHARGE
- `T24.BP/AA.CHARGE.FIELDS.b`
- `T24.BP/AA.CHARGE.VALIDATE.b`
- `T24.BP/AA.CHARGE.UPDATE.b`
- `T24.BP/AA.CHARGE.MAKE.DUE.b`
- `T24.BP/AA.PROCESS.CHARGE.MAKE.DUE.b`
- `T24.BP/AA.CHARGE.REPAY.b`
- `T24.BP/AA.CHARGE.PAY.b`
- `T24.BP/AA.CHARGE.ACCRUE.b`
- `T24.BP/AA.CHARGE.CAPITALISE.b`

### PAYMENT.SCHEDULE
- `T24.BP/AA.PAYMENT.SCHEDULE.FIELDS.b`
- `T24.BP/AA.PAYMENT.SCHEDULE.VALIDATE.b`
- `T24.BP/AA.PAYMENT.SCHEDULE.UPDATE.b`
- `T24.BP/AA.PAYMENT.SCHEDULE.MAKE.DUE.b`
- `T24.BP/AA.PAYMENT.SCHEDULE.CAPITALISE.b`

### SETTLEMENT
- `T24.BP/AA.SETTLEMENT.FIELDS.b`
- `T24.BP/AA.SETTLEMENT.VALIDATE.b`
- `T24.BP/AA.SETTLEMENT.UPDATE.b`
- `T24.BP/AA.SETTLEMENT.DUE.PROCESSING.b`
- `T24.BP/AA.SETTLEMENT.SETTLE.b`
- `T24.BP/AA.SETTLEMENT.ADVANCE.PAY.b`
- `T24.BP/AA.SETTLEMENT.OFFSET.b`
- `T24.BP/AA.SETTLEMENT.PAY.PROCESSING.b`

### PAYMENT.RULES
- `T24.BP/AA.PAYMENT.RULES.FIELDS.b`
- `T24.BP/AA.PAYMENT.RULES.VALIDATE.b`
- `T24.BP/AA.PAYMENT.RULES.UPDATE.b`
- `T24.BP/AA.PAYMENT.RULES.ALLOCATE.b`
- `T24.BP/AA.PAYMENT.RULES.CREATE.DUE.b`
- `T24.BP/AA.PAYMENT.RULES.PRE.BILL.b`

### PERIODIC.CHARGES
- `T24.BP/AA.PERIODIC.CHARGES.FIELDS.b`
- `T24.BP/AA.PERIODIC.CHARGES.VALIDATE.b`
- `T24.BP/AA.PERIODIC.CHARGES.UPDATE.b`
- `T24.BP/AA.PERIODIC.CHARGES.MAKE.DUE.b`
- `T24.BP/AA.PERIODIC.CHARGES.REPAY.b`
- `T24.BP/AA.PERIODIC.CHARGES.PAY.b`
- `T24.BP/AA.PERIODIC.CHARGES.ACCRUE.b`
- `T24.BP/AA.PERIODIC.CHARGES.CAPITALISE.b`
- `T24.BP/AA.PERIODIC.CHARGES.PAYOFF.CAPITALISE.b`

### BALANCE.AVAILABILITY
- `T24.BP/AA.BALANCE.AVAILABILITY.FIELDS.b`
- `T24.BP/AA.BALANCE.AVAILABILITY.VALIDATE.b`
- `T24.BP/AA.BALANCE.AVAILABILITY.UPDATE.b`

### BALANCE.MAINTENANCE
- `T24.BP/AA.BALANCE.MAINTENANCE.FIELDS.b`
- `T24.BP/AA.BALANCE.MAINTENANCE.UPDATE.b`
- `T24.BP/AA.BALANCE.MAINTENANCE.DATA.CAPTURE.b`
- `T24.BP/AA.BALANCE.MAINTENANCE.CAPTURE.BILL.b`

## Tiến độ đọc lại

- `INTEREST`: đã đọc lại sâu nhất; chuẩn action detail đã chốt được cho `ACCRUE`.
- `BALANCE.AVAILABILITY`: đã khóa field chính và action `UPDATE`.
- `BALANCE.MAINTENANCE`: đã khóa field chính, `DATA.CAPTURE`, `CAPTURE.BILL`.
- `ACCOUNT`: đã khóa field nền và các action `UPDATE`, `MAKE.DUE`, `REPAY`.
- `CHARGE`: đã khóa `MAKE.DUE`, `PROCESS.CHARGE.MAKE.DUE`, `REPAY`, `PAY`, `ACCRUE`, `CAPITALISE`.
- `PAYMENT.SCHEDULE`: mới khóa trục chính, còn phải đọc sâu lại từng label.
  - hiện đã khóa thêm được luồng bill-processing thật của `MAKE.DUE` và `CAPITALISE`; còn phải chốt tiếp một số label phụ và side cases.
- `SETTLEMENT`: đã khóa được các action gốc phải đọc là `DUE.PROCESSING`, `SETTLE`, `ADVANCE.PAY`, `OFFSET`, `PAY.PROCESSING`; chưa đi sâu logic.
- `PAYMENT.RULES`: đã khóa được các action gốc phải đọc là `ALLOCATE`, `CREATE.DUE`, `PRE.BILL`; chưa đi sâu logic.
- `PERIODIC.CHARGES`: đã khóa được bộ action đầy đủ hơn web hiện tại, gồm `ISSUE.BILL`, `MAKE.DUE`, `REPAY`, `PAY`, `ACCRUE`, `CAPITALISE`, `DEFER.*`, `PAYOFF.CAPITALISE`, `BILL.*`, `ADJUST.*`.

## Ghi nhận lại từ source trong vòng mới

### SETTLEMENT

#### Source vừa xác nhận
- `T24.BP/AA.SETTLEMENT.FIELDS.b`
- `T24.BP/AA.SETTLEMENT.VALIDATE.b`
- `T24.BP/AA.SETTLEMENT.UPDATE.b`
- `T24.BP/AA.SETTLEMENT.DUE.PROCESSING.b`
- `T24.BP/AA.SETTLEMENT.SETTLE.b`
- `T24.BP/AA.SETTLEMENT.ADVANCE.PAY.b`
- `T24.BP/AA.SETTLEMENT.OFFSET.b`
- `T24.BP/AA.SETTLEMENT.PAY.PROCESSING.b`

#### Field group vừa chốt từ `FIELDS`
- Nhóm `PAYIN.*`
  - `PAYIN.CURRENCY`, `PAYIN.PRD.GROUP`, `PAYIN.PRODUCT` là thông tin sản phẩm/currency của nhánh nạp tiền và đều `NOINPUT` ở field definition, nghĩa là engine tự điền theo ngữ cảnh settlement.
  - `PAYMENT.TYPE` là khóa nghiệp vụ chính, check sang `AA.PAYMENT.TYPE`, và các dòng `PAYIN.*` được gắn dưới từng payment type.
  - `PAYIN.SETTLE.ACTIVITY` và `PAYIN.ACTIVITY` đều check sang `AA.ACTIVITY`; một field là activity settle, một field là activity được phép dùng account/beneficiary đó.
  - `PAYIN.SETTLEMENT` là cờ bật settlement cho payin.
  - `PAYIN.AC.DB.RULE` check sang `AA.SETTLEMENT.TYPE`, tức là rule debit đối với settlement account.
  - `DD.MANDATE.REF` chỉ cho nhập nếu module `DD` được cài.
  - `PAYIN.ACCOUNT`, `PAYIN.BENEFICIARY`, `PAYIN.PO.PRODUCT` cho thấy payin có thể đi theo account nội bộ, beneficiary hoặc payment order product.
  - `PAYIN.PERCENTAGE` và `PAYIN.AMOUNT` là cặp chia tỷ lệ/số tiền của từng destination.
  - `PAYIN.RC.TYPE`, `PAYIN.RC.CONDITION` chỉ mở khi module `RC` được cài.
- Nhóm `PAYOUT.*`
  - `PAYOUT.CURRENCY`, `PAYOUT.PRD.GROUP`, `PAYOUT.PRODUCT` có vai trò đối xứng với `PAYIN.*`.
  - `PAYOUT.PPTY.CLASS` check sang `AA.PROPERTY.CLASS`; đây là class property được nhận payout.
  - `PAYOUT.PROPERTY` là property đích thực sự của payout.
  - phần sau file còn phải đọc tiếp để khóa các field payout account, beneficiary, RC, FX settlement, retry update.

#### Validate bước đầu vừa xác nhận
- `AA.SETTLEMENT.VALIDATE.b` là routine rất lớn, không chỉ kiểm tra field đơn lẻ mà còn cross-validate với:
  - `AA.PAYMENT.SCHEDULE`
  - `AA.PRODUCTFRAMEWORK`
  - `AC.ACCOUNTOPENING`
  - `DD.CONTRACT`
  - `PI.CONFIG`
  - `RC.CONFIG`
  - `AA.ACCOUNT`
- Source comment xác nhận các nhóm logic quan trọng phải đọc sâu tiếp:
  - payin/payout account duplicate
  - payin/payout account không được là arrangement account trong một số case
  - closed/pending closure/cancelled arrangement không được dùng làm settlement account
  - kiểm tra alternate payment method
  - internal FX / counter booking
  - update pending retry cho future-dated settlement account change

### PAYMENT.RULES

#### Source vừa xác nhận
- `T24.BP/AA.PAYMENT.RULES.FIELDS.b`
- `T24.BP/AA.PAYMENT.RULES.VALIDATE.b`
- `T24.BP/AA.PAYMENT.RULES.UPDATE.b`
- `T24.BP/AA.PAYMENT.RULES.ALLOCATE.b`
- `T24.BP/AA.PAYMENT.RULES.CREATE.DUE.b`
- `T24.BP/AA.PAYMENT.RULES.PRE.BILL.b`

#### Field group vừa chốt từ `FIELDS`
- `FINANCIAL.STATUS`
  - field gốc để tách rule theo trạng thái tài chính như performing, suspended, restructure.
- `APPLICATION.TYPE`
  - check sang `AA.PAYMENT.RULE.TYPE`; đây là loại rule áp payment theo current, bill property, bill date, advance...
- `APPLICATION.ORDER`
  - quy định thứ tự áp rule như `OLDEST.FIRST`, `OLDEST.LAST`.
- `SEQUENCE`
  - số thứ tự áp dụng giữa các property trong cùng rule.
- `PROPERTY`
  - property được đem vào rule allocate.
- `BALANCE.TYPE`
  - balance type cụ thể dưới property được allocate hoặc create due.
- `PROP.APPL.TYPE`
  - ở source hiện mới thấy option `BALANCES`, nghĩa là rule có thể áp ở mức balance thay vì toàn property.
- `PRE.BILL.ACTIVITY`
  - hiện đang `NOINPUT`, giữ chỗ cho flow pre-bill.
- `REMAINDER.ACTIVITY`
  - activity dùng để xử lý phần dư sau khi allocate hết các rule chính.
- `MAKE.BILL.DUE`
  - cờ có tạo due bill hay không sau khi allocate.
- `ADVANCE.PAYMENT.METHOD`
  - field điều khiển partial/full advance settlement.
- `ADVANCE.PAYMENT.RESTRICTION`
  - giới hạn số lần/kiểu advance settlement.
- `SETTLE.UNEARNED.INTEREST`
  - cờ cho phép settle trước phần lãi chưa earned.

#### Action lõi vừa chốt từ source
- `ALLOCATE`
  - File gốc: `T24.BP/AA.PAYMENT.RULES.ALLOCATE.b`
  - Đây là action chính của `LENDING-APPLYPAYMENT-PAYMENT.RULES`.
  - Routine đọc rule tài chính đang hiệu lực bằng `AA.PaymentRules.GetFinancialAllocationRule(...)`.
  - `PROCESS.INPUT.ACTION` làm các bước:
    1. lấy repayment amount từ AAA hiện tại qua `GET.REPAYMENT.AMOUNT`
    2. nếu là advance payment thì kiểm tra còn due bill bằng `AA.PaymentSchedule.GetBill(..., "DUE":@VM:"AGING", ...)` và raise override `AA.OUTSTANDING.BILLS.NOT.SETTLED`
    3. nếu không phải advance thì gọi `AA.PaymentRules.AllocatePaymentAmount(...)` để phân bổ số tiền vào:
       - `BILL.REFERENCE`
       - `BILL.PROPERTY`
       - `BILL.PROPERTY.DUE.AMOUNT`
       - `BILL.PROPERTY.REPAY.AMOUNT`
       - `REMAINDER.AMOUNT`
       - `BILL.REPAY.DATES`
    4. lấy tổng amount đã phân bổ thực tế từ `BILL.PROPERTY.REPAY.AMOUNT`
    5. gọi `AA.PayoutRules.UpdateBillPaymentAmounts(...)` để ghi lại payment amount vào bill
    6. nếu còn `REMAINDER.AMOUNT` thì tạo secondary activity remainder và cập nhật lại AAA hiện tại với payment amount sau phân bổ
  - Với technical loan, routine còn đọc `AA.RESTRUCTURE.STATUS`, `AA.ACTIVITY.MAPPING`, `AA.ACTIVITY.BALANCES` để dựng secondary activity trả tiền trên original loan bằng `AA.Framework.SecondaryActivityManager(...)`.
  - Bảng/record thấy bị đụng trực tiếp:
    - `AA.BILL.DETAILS` qua `AA.PayoutRules.UpdateBillPaymentAmounts(...)`
    - AAA secondary activity list qua `AA.Framework.SecondaryActivityManager(...)`
    - `AA.ACTIVITY.BALANCES` được đọc qua `AA.Framework.ProcessActivityBalances(...)`
- `CREATE.DUE`
  - File gốc: `T24.BP/AA.PAYMENT.RULES.CREATE.DUE.b`
  - Action này chỉ chạy khi field `MAKE.BILL.DUE = YES`.
  - Nó đọc rule hiệu lực bằng `GetFinancialAllocationRule(...)`, lấy tất cả bill `ISSUED` bằng `AA.PaymentSchedule.GetBill(...)`, rồi lặp bill:
    - đọc `BILL.DETAILS`
    - xác định `PAYMENT.DATE`, `PAYMENT.METHOD`, `BILL.TYPE`
    - map sang system bill type
    - nếu là bill `PR.CHARGE` hoặc `ACT.CHARGE` thì lấy `PROPERTY.ID` từ bill và chỉ tạo một make-due activity cho mỗi property
  - Activity make-due mới không được viết trực tiếp vào file riêng, mà được append qua cơ chế secondary activity.
- `PRE.BILL`
  - File gốc: `T24.BP/AA.PAYMENT.RULES.PRE.BILL.b`
  - Chỉ tạo AAA phụ khi rule đang là `BILL.PROPERTY` hoặc `BILL.DATE` nhưng hiện tại chưa có bill nào.
  - Các bước:
    1. đọc rule hiệu lực
    2. nếu là rule bill-based thì gọi `AA.PaymentSchedule.GetBill(...)`
    3. nếu `BILL.REFERENCE` rỗng và `PRE.BILL.ACTIVITY.ID` có giá trị thì dựng `AAA.REC`
    4. set:
       - `ArrActArrangement = current arrangement`
       - `ArrActActivity = PRE.BILL.ACTIVITY.ID`
       - `ArrActEffectiveDate = activity effective date`
       - `ArrActLinkedActivity = current txn reference`
    5. append activity qua `AA.Framework.SecondaryActivityManager("APPEND.TO.LIST", AAA.REC)`

### PERIODIC.CHARGES

#### Source vừa xác nhận
- `T24.BP/AA.PERIODIC.CHARGES.FIELDS.b`
- `T24.BP/AA.PERIODIC.CHARGES.VALIDATE.b`
- `T24.BP/AA.PERIODIC.CHARGES.UPDATE.b`
- `T24.BP/AA.PERIODIC.CHARGES.ISSUE.BILL.b`
- `T24.BP/AA.PERIODIC.CHARGES.MAKE.DUE.b`
- `T24.BP/AA.PERIODIC.CHARGES.REPAY.b`
- `T24.BP/AA.PERIODIC.CHARGES.PAY.b`
- `T24.BP/AA.PERIODIC.CHARGES.ACCRUE.b`
- `T24.BP/AA.PERIODIC.CHARGES.CAPITALISE.b`
- `T24.BP/AA.PERIODIC.CHARGES.DEFER.MAKEDUE.b`
- `T24.BP/AA.PERIODIC.CHARGES.DEFER.CAPITALISE.b`
- `T24.BP/AA.PERIODIC.CHARGES.PAYOFF.CAPITALISE.b`
- `T24.BP/AA.PERIODIC.CHARGES.BILL.MAKEDUE.b`
- `T24.BP/AA.PERIODIC.CHARGES.BILL.UPDATE.b`
- `T24.BP/AA.PERIODIC.CHARGES.DEF.BILL.MAKEDUE.b`
- `T24.BP/AA.PERIODIC.CHARGES.DEF.BILL.UPDATE.b`
- `T24.BP/AA.PERIODIC.CHARGES.CAPTURE.BILL.b`
- `T24.BP/AA.PERIODIC.CHARGES.ADJUST.BILL.b`
- `T24.BP/AA.PERIODIC.CHARGES.ADJUST.INFO.BILL.b`

#### Kết luận bước đầu
- Web hiện chỉ phản ánh một phần rất nhỏ của property này.
- Từ danh sách source đã thấy ngay `PERIODIC.CHARGES` có logic bill-processing riêng khá lớn, không thể mô tả đủ nếu chỉ nhìn `MAKE.DUE` và `ISSUE.BILL`.
- Các nhánh phải đọc sâu tiếp theo là:
  - issue bill / bill update
  - bill makedue / deferred bill makedue
  - capitalise / defer capitalise / payoff capitalise
  - adjust bill / capture bill
  - accrue / move balance / suspend / resume nếu chúng tham gia đường tài chính chính

#### Action lõi vừa chốt bước đầu từ source
- `MAKE.DUE`
  - File gốc: `T24.BP/AA.PERIODIC.CHARGES.MAKE.DUE.b`
  - Ngay ở phần đầu source đã chốt được:
    - action này xử lý make due cho deferred periodic charges và đổi status bill trong `BILL.DETAILS`
    - routine lấy context activity, check full chargeoff và nếu có thì chạy ba subtype `BANK`, `CUST`, `CO`
    - nó đọc internal booking trước khi vào main process
    - nhánh xử lý thực sự nằm dưới `PROCESS.INPUT.ACTION` / `PROCESS.DELETE.ACTION` / `PROCESS.AUTHORISE.ACTION` theo từng subtype
  - Từ source hiện đã chắc:
    - có dùng `AA.ChargeOff.GetChargeoffDetails(...)`
    - có dùng `AA.PaymentSchedule`
    - có dùng `AA.ActivityCharges`
    - có dùng `AA.Accounting`
    - có hỗ trợ `ALT.CHARGE` cho alternate periodic charge property
- `CAPITALISE`
  - File gốc: `T24.BP/AA.PERIODIC.CHARGES.CAPITALISE.b`
  - Source xác nhận action này theo cùng khung với `MAKE.DUE`, nhưng khác ở accounting và bill status.
  - Các điểm đã chốt:
    - check full chargeoff và chạy subtype `BANK/CUST/CO`
    - xác định payoff/closure qua `AA.Framework.DeterminePayoffProcess(...)`
    - lấy bill theo nhiều nhánh:
      - `CAPITALISE`
      - `DEFER.CAPITALISE`
      - trong một số case lấy thêm bill `DUE`
    - đọc `BILL.DETAILS` bằng `AA.PaymentSchedule.GetBillDetails(...)`
    - đọc property amount bằng `AA.PaymentSchedule.GetBillPropertyAmount(...)`
    - đọc waive amount, suspend amount và tax consolidated amount
    - dựng event accounting bằng `AA.Accounting.BuildEventRec(...)`
    - handoff accrual bằng `AA.Framework.AccrualDetailsHandoff(...)`
    - đẩy accounting queue bằng `AA.Accounting.AccountingManager(...)`
  - Kết luận: đây là routine tài chính thật của periodic charges capitalise, không chỉ đổi status bill.
- `BILL.UPDATE`
  - File gốc: `T24.BP/AA.PERIODIC.CHARGES.BILL.UPDATE.b`
  - Đây là routine chuyên update `BILL.DETAILS` và payment/schedule/account details sau capitalise.
  - Các bước đã chốt từ source:
    1. `PROCESS.BILLS`
       - `CHECK.ACCOUNT.BALANCE`
       - `GET.BILL`
       - `GET.BALANCE.TYPES`
       - lặp từng `BILL.REFERENCE`
    2. với mỗi bill:
       - `GET.BILL.DETAILS`
       - `GET.PAYMENT.TYPE`
       - `GET.PROPERTY.AMOUNT`
       - nếu không phải deferred path thì `UPDATE.PAYMENT.DETAILS`
       - `DELETE.OLD.BILL.DETAILS`
       - `BUILD.BILL.ARRAY`
       - gọi `AA.PaymentSchedule.BillsManager(...)` để ghi lại bill
       - nếu có tax thì `UPDATE.TAX.AMOUNT`
       - nếu arrangement/property suspended thì:
         - `AA.PaymentSchedule.UpdateBillPropertyAmount(..., "SUSPEND", ...)`
         - `AA.PaymentSchedule.UpdateBillDetails(...)`
       - nếu `RAISE.DUE.BILL` thì `UPDATE.CAP.AMOUNT`
    3. sau vòng bill:
       - nếu không còn bill hoặc không tìm thấy property thì lấy payment dates rồi `UPDATE.PAYMENT.DETAILS`
       - nếu không lỗi và không phải closure trigger thì `UPDATE.NEXT.SCHEDULE.DETAILS`
  - Bảng/record thấy bị đụng trực tiếp:
    - `AA.BILL.DETAILS`
      - qua `AA.PaymentSchedule.BillsManager(...)`
      - qua `AA.PaymentSchedule.UpdateBillPropertyAmount(...)`
      - qua `AA.PaymentSchedule.UpdateBillDetails(...)`
    - `AA.ACCOUNT.DETAILS`
      - trong nhánh reverse có gọi `AA.PaymentSchedule.ProcessAccountDetails(ARRANGEMENT.ID, "REVERSE", "BILL", UPDATE.INFO, RET.ERROR)`
    - payment dates / next schedule
      - qua `UPDATE.PAYMENT.DETAILS` và `UPDATE.NEXT.SCHEDULE.DETAILS`

### PAYMENT.SCHEDULE

#### Bill-processing vừa chốt sâu hơn từ source
- `MAKE.DUE`
  - File gốc: `T24.BP/AA.PAYMENT.SCHEDULE.MAKE.DUE.b`
  - Luồng tài chính đã khóa được:
    1. `PROCESS.INPUT.ACTION`
       - `GET.LAST.PAYMENT.DATE`
       - `RECALCULATE.DUE.AMOUNTS`
       - `PROCESS.ISSUE.BILL`
       - nếu không phải handoff-charge thì vào `PROCESS.INPUT.ACTION.FINANCIAL`
    2. `PROCESS.INPUT.ACTION.FINANCIAL`
       - `GET.BILL`
       - lặp từng `BILL.REFERENCE`
       - `GET.BILL.DETAILS`
       - nếu là advance schedule bill thì `AA.PaymentSchedule.UpdateAdvanceOriginalAmounts(...)`
       - `GET.DUE.AMOUNTS`
       - `GET.ADJUSTMENT.AMOUNT`
       - `GET.BILL.PAYMENT.DATES`
       - `UPDATE.BILL.DETAILS`
       - `UPDATE.BILL.STATUS`
       - `UPDATE.PAYMENT.DETAILS`
       - `UPDATE.SETTLEMENT.STATUS`
       - `WRITE.BILL.DETAILS`
       - nếu bill type là `PAYMENT` thì append bill ref vào `ACCRUE.BILL.REFERENCE`
    3. sau vòng bill:
       - nếu có payment type còn lại ngoài bill thì `GET.PAYMENT.DATES` rồi `UPDATE.PAYMENT.DETAILS`
       - nếu không có bill thì cũng `GET.PAYMENT.DATES` rồi `UPDATE.PAYMENT.DETAILS`
       - nếu có `ACCRUE.BILL.REFERENCE` thì gọi `AA.Interest.CreateBillInterestAccruals(...)`
       - gọi `AA.PaymentSchedule.ChargeAccrualHandoff(...)`
       - nếu không phải closure trigger thì `UPDATE.NEXT.SCHEDULE.DETAILS`
       - gọi `UPDATE.AA.SCHEDULED.ACTIVITY`
       - có thể append secondary activity qua `AA.Framework.SecondaryActivityManager(...)` cho progressive payment / recalculate payment schedule
  - Bảng/record thấy bị đụng trực tiếp:
    - `AA.BILL.DETAILS`
      - qua `AA.PaymentSchedule.UpdateBillPropertyAmount(...)`
      - qua `AA.PaymentSchedule.UpdateBillStatus(...)`
      - qua `AA.PaymentSchedule.UpdateBillDetails(...)`
    - `AA.ACCOUNT.DETAILS`
      - qua `UPDATE.PAYMENT.DETAILS`
      - và trong reverse qua `AA.PaymentSchedule.ProcessAccountDetails(...)`
    - bill-wise interest accrual
      - qua `AA.Interest.CreateBillInterestAccruals(...)`
    - charge accrual handoff
      - qua `AA.PaymentSchedule.ChargeAccrualHandoff(...)`
    - `AA.SCHEDULED.ACTIVITY`
      - qua `UPDATE.AA.SCHEDULED.ACTIVITY`
- `CAPITALISE`
  - File gốc: `T24.BP/AA.PAYMENT.SCHEDULE.CAPITALISE.b`
  - Luồng đã khóa được:
    1. `PROCESS.INPUT.ACTION`
       - `GET.LAST.PAYMENT.DATE`
       - `CHECK.FOR.PROJECTED.BILL`
       - `GET.HANDOFF.CHARGE.VALUE`
       - nếu không projected bill:
         - `RECALCULATE.DUE.AMOUNTS`
         - `PROCESS.ISSUE.BILL`
         - nếu handoff charge thì `UPDATE.HANDOFF.PAYMENT.DETAILS`
         - nếu không thì `PROCESS.NON.PROJECTED.FINANCIAL.BILL`
    2. sau khi xử lý bill:
       - `AA.PaymentSchedule.ChargeAccrualHandoff(...)`
       - nếu không phải interim case đặc biệt thì:
         - `UPDATE.NEXT.SCHEDULE.DETAILS`
         - `CHECK.PAYMENT.END.DATE`
         - `UPDATE.AA.SCHEDULED.ACTIVITY`
    3. trong nhánh reverse:
       - `GET.BILL`
       - lặp bill:
         - `GET.BILL.DETAILS`
         - `GET.DUE.AMOUNTS`
         - `GET.ADJUSTMENT.AMOUNT`
         - `GET.BILL.PAYMENT.DATES`
         - `UPDATE.BILL.DETAILS`
         - `UPDATE.BILL.STATUS`
         - `UPDATE.PAYMENT.DETAILS`
         - `UPDATE.SETTLEMENT.STATUS`
         - `WRITE.BILL.DETAILS`
       - nếu cần thì `GET.PAYMENT.DATES`
       - `UPDATE.PAYMENT.DETAILS`
       - `PROCESS.ISSUE.BILL`
       - `UPDATE.NEXT.SCHEDULE.DETAILS`
  - Bảng/record thấy bị đụng trực tiếp:
    - `AA.BILL.DETAILS`
      - qua `AA.PaymentSchedule.UpdateBillPropertyAmount(...)`
      - qua `AA.PaymentSchedule.UpdateBillStatus(...)`
      - qua `AA.PaymentSchedule.UpdateBillDetails(...)`
    - `AA.ACCOUNT.DETAILS`
      - qua `AA.PaymentSchedule.ProcessAccountDetails(...)` trong `DELETE.OLD.BILL.DETAILS`
      - và qua `UPDATE.PAYMENT.DETAILS`
    - `AA.SCHEDULED.ACTIVITY`
      - qua `UPDATE.AA.SCHEDULED.ACTIVITY`
    - projected capitalise bill cache/table
      - qua `AA.PaymentSchedule.GetProjectedCapitaliseBill(...)`
      - và `AA.PaymentSchedule.ProjectCapitaliseBillsReverse(...)`

### SETTLEMENT

#### Action lõi vừa chốt bước đầu từ source
- `SETTLE`
  - File gốc: `T24.BP/AA.SETTLEMENT.SETTLE.b`
  - Đây là action điều phối autosettlement, không tự làm hết logic tài chính trong cùng file.
  - Source xác nhận routine này được trigger từ `AA.SETTLEMENT.CHECK.SETTLE` và dùng cho `NEW-ARRANGEMENT`, `MAKEDUE`, `REDEEM`, `MATURE`.
  - Các bước khung:
    1. lấy `R.ACTIVITY.STATUS`, `ARRANGEMENT.ID`, `ARR.ACTIVITY.ID`, `LINKED.ACTIVITY`
    2. xác định `REQUEST.TYPE`:
       - `CAPITALISE`
       - `PAYOFF`
       - hoặc rỗng cho due/pay thường
    3. `PERFORM.VALIDATION`
    4. `GET.SETTLEMENT.ARRAY`
    5. `PERFORM.PAYOUT.PROCESSING` bằng `AA.Settlement.SettlementPayProcessing(PO.SETTLEMENT.ARRAY, REQUEST.TYPE)`
    6. `PERFORM.PAYIN.PROCESSING` cho due processing
  - Kết luận: file này là orchestration layer; logic payin thật phải đọc ở `AA.SETTLEMENT.DUE.PROCESSING.b`, logic pay thật phải đọc ở `AA.SETTLEMENT.PAY.PROCESSING.b`.
- `DUE.PROCESSING`
  - File gốc: `T24.BP/AA.SETTLEMENT.DUE.PROCESSING.b`
  - Program description xác nhận đây là routine làm due processing thật, được gọi từ `AA.SETTLEMENT.SETTLE`.
  - Từ phần đầu source đã chốt:
    - input là `SETTLEMENT.ARRAY` và `REQUEST.TYPE`
    - `REQUEST.TYPE = CAPITALISE` thì làm capitalise cho off-balance accounts
    - `REQUEST.TYPE = PAYOFF` thì làm payoff processing
    - nếu rỗng thì làm normal due processing
    - routine gọi:
      - `GET.PAYIN.DETAILS`
      - `SETTLEMENT.CAPITALISE.PROCESSING` hoặc `SETTLEMENT.DUE.PROCESSING`
      - `SETTLEMENT.REVERSAL.PROCESS`
    - nó dùng các package:
      - `AA.Account`
      - `AA.Accounting`
      - `AA.Framework`
      - `AA.ProductFramework`
      - `AA.Settlement`
      - `AC.AccountOpening`
      - `AC.SoftAccounting`
      - `ST.ExchangeRate`
    - comment và history xác nhận routine này có các đường xử lý:
      - cross-currency settlement
      - posting restriction check
      - off-balance capitalise
      - payoff amount
      - update activity balances bằng amount LCY để dựng entry đúng
      - secondary activity có processing date
- `PAY.PROCESSING`
  - File gốc: `T24.BP/AA.SETTLEMENT.PAY.PROCESSING.b`
  - Đây là routine payout thật, song song với `DUE.PROCESSING`.
  - Luồng đầu source đã chốt:
    1. `GET.PAYOUT.DETAILS`
       - đọc payout setup từ `SETTLEMENT.ARRAY`:
         - settle activities
         - payout accounts
         - AA account activities
         - payout property class/property
         - percentage/amount
         - RC type / RC condition
         - settlement type
       - gọi `AA.Settlement.GetPostingRestrict(...)` để kiểm tra posting restriction cho:
         - payout accounts
         - linked arrangement account
         - counter booking account
    2. nếu `CAPITALISE.PROCESS` hoặc `CHARGE.HANDOFF.PROCESS` thì đi vào `SETTLEMENT.CAPITALISE.PROCESSING`
    3. nếu không thì đi vào `SETTLEMENT.PAY.PROCESSING`
  - Bên trong `SETTLEMENT.PAY.PROCESSING`:
    - lặp từng multi-value payout instruction
    - kiểm tra `PAYOUT.SWITCH`
    - lấy property payout và gọi `DETERMINE.SETTLE.AMOUNT`
    - nếu có percentage/amount thì gọi `AA.Settlement.DetermineSplitAmount(...)`
    - nếu có counter booking account và không phải payoff thì:
      - `DERIVE.COUNTER.BOOKING.ACCOUNT`
      - `PROCESS.COUNTER.BOOKING.ACCOUNTS`
    - với từng payout account:
      - `DERIVE.PAYOUT.ACCOUNT`
      - `EXCHANGE.RATE.PROCESS`
      - `EVALUATE.SETTLE.RULES`
      - dựng chuỗi `PROPERTY = <account>.CREDIT/DEBIT...` để lưu vào `AA.ACTIVITY.BALANCES`
      - gọi `PROCESS.ACTIVITY.BALANCE`
      - gọi `UPDATE.ACTIVITY.BALANCE`
      - gọi `RESOLVE.ACCOUNTING.ENTRIES`
      - cuối cùng `TRIGGER.ACTIVITY` để đẩy applypayment/payout activity phụ
  - Bảng/record thấy bị đụng trực tiếp hoặc rõ qua API:
    - `AA.ACTIVITY.BALANCES` qua `PROCESS.ACTIVITY.BALANCE` và `UPDATE.ACTIVITY.BALANCE`
    - accounting queue qua `AA.Accounting.AccountingManager(...)`
    - secondary AAA qua `TRIGGER.ACTIVITY`
  - Kết luận:
    - `PAY.PROCESSING` không chỉ raise accounting; nó còn build `AA.ACTIVITY.BALANCES` làm nguồn cho accounting/suspense và có thể trigger activity phụ theo settlement instruction.

## Ghi nhận đào sâu tiếp theo

### SETTLEMENT.DUE.PROCESSING

- Đi sâu thêm từ thân routine:
  - `GET.PAYIN.DETAILS` đọc toàn bộ payin side của `SETTLEMENT.ARRAY`:
    - activities
    - accounts
    - AA account activities
    - payment types
    - debit rules
    - settlement type
    - RC type / RC condition
    - percentage / amount
  - routine kiểm tra posting restriction cho:
    - payin accounts
    - linked arrangement account
    - counter booking account
- `SETTLEMENT.DUE.PROCESSING` làm thật các bước:
  1. lặp từng multi-value payin instruction
  2. lấy `PAYIN.SWITCH`, `SETTLE.OPTION`, settlement type, multi-value position
  3. nếu có percentage/amount thì bật `SPLIT.PROCESS.TYPE = "SPLIT"`
  4. nếu không bị RC trong COB chặn thì `DETERMINE.SETTLE.AMOUNT`
  5. `CHECK.PAYIN.ACCT`
  6. `PARSE.ACCT.BALANCE.DUES`
  7. nếu có counter booking account thì `DERIVE.COUNTER.BOOKING.ACCOUNT`
  8. `DERIVE.PAYIN.ACCOUNT`
  9. `PROCESS.ACTIVITY.BALANCE`
  10. `UPDATE.ACTIVITY.BALANCE`
  11. `RESOLVE.ACCOUNTING.ENTRIES`
  12. `TRIGGER.ACTIVITY`
- `DETERMINE.SETTLE.AMOUNT` rẽ nhánh:
  - external restructure: lấy info bill amount
  - charge handoff non-financial: lấy capitalisation amount
  - capitalise process: lấy capitalisation amount
  - payoff process: gọi `AA.Settlement.GetPayoffAmount(...)`
  - case thường: gọi `AA.Settlement.GetPayDueBalances(...)`
  - nếu có counter booking account thì gọi `AA.Settlement.DetermineCounterBookingAmounts(...)`
- `PARSE.ACCT.BALANCE.DUES` gọi `AA.Settlement.DetermineSettleDueAmounts(...)` để ra:
  - `SETTLEMENT.ACCOUNTS`
  - `SETTLEMENT.AMOUNTS`
  - `SETTLEMENT.AMOUNTS.DCY`
  - `SETTLEMENT.AMOUNTS.LCY`
  - `TOT.ALLOCATED.AMOUNT`
  - `SETTLEMENT.ACTIVITY.LIST`
- `SETTLEMENT.REVERSAL.PROCESS`:
  - đọc `AA.ACTIVITY.BALANCES` với `PROCESS.TYPE = GET.SUSP` và `GET`
  - derive payin account
  - resolve accounting entries reversal
  - reverse `AA.ACTIVITY.BALANCES` bằng `PROCESS.TYPE = REVERSE` rồi `UPDATE.ACTIVITY.BALANCE`
- Kết luận bổ sung:
  - `SETTLEMENT.DUE.PROCESSING` hiện đã đủ chắc để coi là routine due/payin lõi của nhóm settlement, với update chính nằm ở `AA.ACTIVITY.BALANCES`, accounting queue và secondary AAA.

### PERIODIC.CHARGES.REPAY

- File gốc: `T24.BP/AA.PERIODIC.CHARGES.REPAY.b`
- Đây là action repayment accounting thật của periodic charges.
- Các bước đã chốt:
  1. lấy bills repaid theo `REPAYMENT.REFERENCE = ARR.ACTIVITY.ID : effective date`
  2. hỗ trợ full chargeoff bằng subtype `BANK`, `CUST`, `CO`
  3. với từng bill:
     - `GET.BILL.DETAILS`
     - `GET.PROPERTY.AMOUNT`
     - `GET.PROPERTY.BALANCE`
     - `BUILD.ACCOUNTING.UPDATES`
  4. nếu có suspend amount thì gọi `AA.Fees.ChargeRepaySuspense(...)`
  5. cuối cùng `PROCESS.ACCOUNTING.UPDATES`
- Bảng/record thấy bị đọc/đụng:
  - `AA.BILL.DETAILS` qua `GetBill(...)` và `GetBillDetails(...)`
  - accounting queue qua `AA.Accounting.AccountingManager(...)`
- Kết luận:
  - `REPAY` không tự update bill trong file này; nó đọc bill rồi raise repayment/suspend accounting entries.

### PERIODIC.CHARGES.PAY

- File gốc: `T24.BP/AA.PERIODIC.CHARGES.PAY.b`
- Là payout-side action, tương tự `PAY CHARGE`.
- Các bước đã chốt:
  1. lấy bill theo `REPAYMENT.REFERENCE`
  2. `GET.BILL.DETAILS`
  3. `GET.PROPERTY.AMOUNT` bằng `AA.PaymentSchedule.GetBillPropertyAmount(...)`
  4. `GET.PROPERTY.BALANCE`
  5. lấy event type bằng `AA.Accounting.GetAccountingEventType(..., "PAY", ADDITIONAL.INFO, ...)`
  6. gọi `AA.Accounting.AccountingManager(...)`
- Bảng/record thấy bị đọc/đụng:
  - `AA.BILL.DETAILS`
  - accounting queue
- Kết luận:
  - `PAY` là action accounting thật, không phải wrapper; file này không ghi bill trực tiếp.

### PERIODIC.CHARGES.ACCRUE

- File gốc: `T24.BP/AA.PERIODIC.CHARGES.ACCRUE.b`
- Toàn bộ logic trong file là gọi `AA.Fees.ChargeAccrue()`.
- Kết luận:
  - `ACCRUE PERIODIC.CHARGES` hiện là wrapper hoàn toàn; muốn mô tả chi tiết phải quay sang implementation dùng chung của charge accrue.
