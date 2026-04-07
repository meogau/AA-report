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

### Batch tiếp theo đã đọc lại và đưa sang web override

#### CONSTRAINT
- Source đã đọc:
  - `T24.BP/AA.CONSTRAINT.FIELDS.b`
  - `T24.BP/AA.CONSTRAINT.UPDATE.b`
- Chốt từ `FIELDS`:
  - `TYPE` nhận các giá trị `INTEREST.PERIOD`, `STATEMENT.PERIOD`, `RENEWAL_PERIOD`, `FINANCIAL.YEAR`, `DATE`.
  - `RESULT` là `ERROR` hoặc `OVERRIDE`.
  - `ERROR.MESSAGE` check sang `EB.ERROR`.
  - `OVERRIDE.MESSAGE` check sang `OVERRIDE`.
  - `ACTIVITY.FUNCTION` chỉ ra constraint chạy ở `INPUT` hay `REVERSE`.
- Chốt từ `UPDATE`:
  - routine hiện chỉ là khung status/error/logging.
  - chưa thấy source tự `READ`/`WRITE` bảng business.

#### CUSTOMER
- Source đã đọc:
  - `T24.BP/AA.CUSTOMER.FIELDS.b`
  - `T24.BP/AA.CUSTOMER.UPDATE.b`
  - `T24.BP/AA.CUSTOMER.PROCESS.b`
  - `T24.BP/AA.CUSTOMER.DATACAPTURE.b`
- Chốt từ `FIELDS`:
  - `CUSTOMER`, `CUSTOMER.ROLE` là cặp field chính để ghi owner/joint holder.
  - `TAX.LIABILITY.PERC`, `LIMIT.ALLOC.PERC`, `GL.ALLOC.PERC` là các tỷ lệ phân bổ theo customer.
  - `DELIVERY.REQD` mở cho arrangement level.
  - `JS.LIABLE` là joint and several liability.
  - `OTHER.PARTY`, `ROLE`, `NOTES` mở thêm đối tượng liên quan ngoài owner chính.
  - `CRA.CUSTOMER` là customer được đưa sang CRA.
- Chốt từ `UPDATE`:
  - `CHANGE-CUSTOMER` current/backdated gọi `AA.Framework.UpdateArrangement(...)` để cập nhật `AA.ARRANGEMENT`.
  - concat customer được update qua `AA.Framework.UpdateCustomerArrangement(...)` với các mode `UNAUTH`, `UNAUTH-DELETE`, `UPDATE`, `DELETE`.
  - auth/reverse change customer còn gọi `ST.DormancyMonitor.CdmTriggerHandoff(...)` cho customer mới/cũ.
  - `FACILITY` change customer ở `UNAUTH` sẽ cascade xuống drawings bằng `AA.Customer.DrawingsCustomerChange(...)`.
  - `AUTH`/`AUTH-REV` còn gọi `AA.Customer.UpdateCraDetails(...)`.
- Chốt từ `PROCESS`:
  - chỉ cập nhật `AA.ARRANGEMENT.SIM` qua `UpdateArrangement(...)` với cờ simulation.
- Chốt từ `DATACAPTURE`:
  - lấy narrative từ AAA, nối `-External`, set vào `CusNotes`.

#### DORMANCY
- Source đã đọc:
  - `T24.BP/AA.DORMANCY.FIELDS.b`
  - `T24.BP/AA.DORMANCY.UPDATE.b`
  - `T24.BP/AA.DORMANCY.EVALUATE.b`
  - `T24.BP/AA.DORMANCY.SET.b`
- Chốt từ `FIELDS`:
  - `STATUS`, `PERIOD`, `NOTICE.DAYS`, `NOTICE.FREQ`, `CHARGE.FREQUENCY` điều khiển status và lịch dormancy.
  - `EXCEPTION.API`, `EXCEPTION.RULE` phục vụ exception processing.
  - `ACTIVITY.INITIATION`, `ACTIVITY.CLASS`, `ACTIVITY.NAME`, `INCLUDE.INDICATOR` là bộ lọc active activity.
  - `AUTO.RESET.STATUS`, `AUTO.RESET.ACTIVITY` điều khiển reset dormancy.
- Chốt từ `UPDATE`:
  - ghi dormancy vào `AA.ACCOUNT.DETAILS` qua `AA.PaymentSchedule.ProcessAccountDetails(...)`.
  - auth/auth-rev gọi `ST.DormancyMonitor.CdmTriggerHandoff(...)`.
- Chốt từ `EVALUATE`:
  - dùng `DetermineDormancyStatus`, `GetDormancyBaseDetails`, `EvaluateActiveActivityDate`, `EvaluateExceptionRules`.
  - nếu đủ điều kiện thì tạo set-dormancy secondary activity, nếu không thì store exception.
- Chốt từ `SET`:
  - lấy target status từ current activity.
  - cập nhật `AA.ACCOUNT.DETAILS`.
  - reschedule evaluation/notice/charge theo status mới.

#### ELIGIBILITY
- Source đã đọc:
  - `T24.BP/AA.ELIGIBILITY.FIELDS.b`
  - `T24.BP/AA.ELIGIBILITY.MAINTAIN.b`
- Chốt từ `FIELDS`:
  - `RULE`, `FAILURE.TYPE`, `FAILURE.ACTION` là nhóm quyết định eligibility outcome.
  - `CUSTOMER.ROLE`, `ROLE.RULE`, `ROLE.FAILURE.*` là nhóm xét riêng theo role.
  - `CHANGE.ACTIVITY` là activity sẽ dùng khi eligibility fail.
  - `PERIODIC.REVIEW`, `REVIEW.FREQUENCY`, `LAST.RUN.DATE` phục vụ periodic review.
  - `ELIGIBILE.DEFAULT.PRD` là product fallback khi phải change product.
- Chốt từ `MAINTAIN`:
  - đọc property `ACCOUNT` để lấy date convention/date adjustment/bus days.
  - gọi `AA.Rules.GetRecalcDate(...)` để tính `NEXT.CYCLED.DATE`.
  - cập nhật `AA.SCHEDULED.ACTIVITY` cho periodic eligibility review.
  - luôn gọi `AA.Framework.UpdateChangeCondition()`.

#### EVIDENCE
- Source đã đọc:
  - `T24.BP/AA.EVIDENCE.FIELDS.b`
  - `T24.BP/AA.EVIDENCE.UPDATE.b`
- Chốt từ `FIELDS`:
  - nhóm `COVENANT.*` định nghĩa requirement, rule, start date, frequency, consequence cho covenant.
  - nhóm `CONDITION.*` định nghĩa evidence requirement và due activity cho condition.
- Chốt từ `UPDATE`:
  - bỏ qua khi replay mode.
  - auth chuẩn hóa effective date với today.
  - chọn mode `UPDATE`, `AMEND`, `REVERSE` bằng `GET.MODE`.
  - handoff sang EV bằng `AA.Evidence.ProcessEvidenceUpdate(...)`.
  - auth-rev của non-new arrangement sẽ đọc previous property rồi amend lại.

#### INHERITANCE
- Source đã đọc:
  - `T24.BP/AA.INHERITANCE.FIELDS.b`
  - `T24.BP/AA.INHERITANCE.UPDATE.b`
- Chốt từ `FIELDS`:
  - nhóm target gồm `DEFAULT.TARGET.INHERITANCE`, `TARGET.PROPERTY`, `TARGET.INHERITANCE`.
  - nhóm source gồm `SOURCE.PRODUCT`, `SOURCE.PROPERTY`, `DEFAULT.SOURCE.INHERITANCE`, `DEF.SOURCE.PROPERTY`, `SOURCE.CURRENCY`, `SOURCE.INHERITANCE`.
- Chốt từ `UPDATE`:
  - chỉ ở `UNAUTH` mới xử lý.
  - nếu activity là `CHANGE.SOURCE`, `CHANGE.TARGET`, `CHANGE.PARENT`, `TRANSFORM` và có `FacilityFlag` hoặc `ArrangementLinkType` thì append secondary activity `<ProductLine>-INHERIT-ARRANGEMENT`.

#### OFFICERS
- Source đã đọc:
  - `T24.BP/AA.OFFICERS.FIELDS.b`
  - `T24.BP/AA.OFFICERS.UPDATE.b`
- Chốt từ `FIELDS`:
  - `PRIMARY.OFFICER`, `OTHER.OFFICER`, `OFFICER.ROLE`, `NOTES`.
- Chốt từ `UPDATE`:
  - `UNAUTH`, `DELETE`, `REVERSE` chỉ gọi `AA.Framework.UpdateChangeCondition()`.
  - chưa thấy source update file officer riêng.

#### REPORTING
- Source đã đọc:
  - `T24.BP/AA.REPORTING.FIELDS.b`
  - `T24.BP/AA.REPORTING.UPDATE.b`
  - `T24.BP/AA.REPORTING.UPDATE.STAGE.b`
  - `T24.BP/AA.REPORTING.UPDATE.CASHFLOW.b`
  - `T24.BP/AA.REPORTING.TRIGGER.b`
  - `T24.BP/AA.REPORTING.POSITION.MANAGEMENT.b`
  - `T24.BP/AA.REPORTING.INTEGRITY.CHECK.b`
- Chốt từ `FIELDS`:
  - `IAS.CLASSIFICATION`, `IAS.SUBTYPE`, `MARKET.KEY`, `MARKET.MARGIN`, `MARGIN.OPERAND`.
  - nhóm `ACTIVITY.NAME`, `CASH.FLOW`, `PROPERTY`, `EXCLUDE.EIR`.
  - `EXPECTED.TERM`.
  - nhóm PM gồm `DEALER.DESK`, `PROPERTY.CLASS`, `PROPERTY.ID`, `POS.CLASS.*`, `APR.TYPE`, `LINKED.INT.PROPERTY`.
- Chốt từ `UPDATE`:
  - chỉ track `UpdateChangeCondition()`.
- Chốt từ `UPDATE.STAGE`:
  - đọc `EB.CASHFLOW`, đọc `AA.ACCOUNT.DETAILS`, cập nhật `AdRiskStage`, set lại account details.
- Chốt từ `UPDATE.CASHFLOW`:
  - lấy `START.DATE` từ master activity.
  - input map cashflow events rồi gọi `AA.Reporting.UpdateCashflow(...)`.
  - delete gọi `UpdateCashflow(..., "DEL", ...)`.
  - reverse đếm activity bằng `AA.Rules.GetActivityCount(...)` để quyết định `REV` hay amend.
- Chốt từ `TRIGGER`:
  - dùng `CheckPmProcessRequired(...)`, `DeterminePmMode(...)`, `PM.Engine.UpdateListWrite(...)`.
- Chốt từ `POSITION.MANAGEMENT`:
  - đọc `AA.ARRANGEMENT`, property `ACCOUNT`, `CURRENCY`, reporting details, reset conditions, cashflow details rồi handoff PM.
- Chốt từ `INTEGRITY.CHECK`:
  - đọc reporting/account property bằng `GetArrangementConditions(...)`.
  - lấy APR rates từ `CW.CashFlow.StFetchAprRate(...)`.
  - đối chiếu `APR.TYPE` và rate với account property, raise problem category nếu lệch.

### Batch kế tiếp đã đọc lại và đưa sang web override

#### AC.ACCT.GROUP.CONDN
- Source đã đọc:
  - `T24.BP/AA.AC.ACCT.GROUP.CONDN.FIELDS.b`
- Chốt từ `FIELDS`:
  - nhóm `THRESHOLD / TXN.CODE.GRP / WAIVE.CR.INT / NO.VIOLATION`.
  - `RETENTION.PERIOD` kiểu `PRD`.
  - `PREMIUM.TYPE` check `SAVINGS.PREMIUM`.
  - `CHARGE.PENDING.CAT`, `TAX.PENDING.CAT` check `CATEGORY`.
  - `CREDIT.CHECK` chọn giữa `WORKING`, `FORWARD`, `AVAILABLE`, `AVAILWORK`, `AVAILFWD`.
  - `AVAILABLE.BAL.UPD` chọn `BOTH`, `NONE`, `DEBITS`, `CREDITS`.
  - `DEBIT.RESTRICT`, `RESTRICTED.MSG`, `NOTICE.*`.
- Chưa thấy action/update routine riêng trong batch source hiện tại.

#### AC.GENERAL.CHARGE
- Source đã đọc:
  - `T24.BP/AA.AC.GENERAL.CHARGE.FIELDS.b`
- Chốt từ `FIELDS`:
  - nhóm charge config classic như `DEBIT.INT.ADDON`, `GOVERNMENT.MARGIN`, `HIGHEST.DEBIT`, `STATEMENT.CHARGE`.
  - nhóm transaction-code charge: `TRANS.CODE.CHARGE`, `COMB.TRNS.CHRG.CODE`, `TR.CODE.CR`, `TR.CODE.DR`, `CHARGE.CODE.LEVEL`.
  - nhóm offset charge: `PERCT.FOR.OFFSET`, `OFFSET.BAL.TYPE`, `OFFSET.CURRENCY`, `MIN.AV.BAL`, `DAY.BASIS`, `BAL.NO.OFFSET`, `LOW.AMT.CHARGE`.
  - nhóm interest charge balance: `INT.CHRG.BAL.TYPE`, `INT.CHARGE.DEF.BAL`, `INT.CHRG.CCY`, `INT.CHRG.BAL`.
- Chưa thấy action/update routine riêng trong batch source hiện tại.

#### AC.GROUP.CAP
- Source đã đọc:
  - `T24.BP/AA.AC.GROUP.CAP.FIELDS.b`
- Chốt từ `FIELDS`:
  - `DR.CAP.FREQUENCY`, `DR2.CAP.FREQUENCY`, `CR.CAP.FREQUENCY`, `CR2.CAP.FREQUENCY`.
  - `SETTLE.ACCT.CLOSE`.
  - `START.OF.DAY.CAP`.
- Chưa thấy action/update routine riêng trong batch source hiện tại.

#### AC.GROUP.INTEREST
- Source đã đọc:
  - `T24.BP/AA.AC.GROUP.INTEREST.FIELDS.b`
- Chốt từ `FIELDS`:
  - nhóm credit minimum/waive/offset/zero-interest/open-close accrual.
  - nhóm debit minimum/waive.
  - `MAX.LEGAL.RATE`, `MAX.DEBIT.CHG.RATE`, `APR.REQUIRED`.
  - `BAL.CALC.ROUTINE`.
  - `DEFER.DB.INT.DAYS`, `DB.INT.PENDING.CAT`.
  - `INT.POST.PERIOD`, `RATE.CHANGE.ADVICE`, `ADVICE.TYPE`.
  - nhóm tax/rounding/balance type cho credit và debit.
- Chưa thấy action/update routine riêng trong batch source hiện tại.

#### ACCOUNT.CONSENT
- Source đã đọc:
  - `T24.BP/AA.ACCOUNT.CONSENT.FIELDS.b`
  - `T24.BP/AA.ACCOUNT.CONSENT.UPDATE.b`
  - `T24.BP/AA.ACCOUNT.CONSENT.VALIDATE.b`
  - `T24.BP/AA.ACCOUNT.CONSENT.EXPIRE.b`
  - `T24.BP/AA.ACCOUNT.CONSENT.CLOSE.b`
- Chốt từ `FIELDS`:
  - nhóm TPP và signup: `EB.EXTERNAL.USER.ID`, `SIGNUP.SERVICE`, `TPP.REFERENCE`, `TPP.NAME`, `ACCESS.FREQUENCY`.
  - nhóm consent tổng: `DEF.CONSENT.TYPE`, `EXT.REF.ID`, `RECURRING.INDICATOR`, `CONSENT.ID`, `ONLINE.ARRANGEMENT`.
  - nhóm account-level: `ACCOUNT.ID`, `ACC.CONSENT.TYPE`, `ACC.BLOCK`, `ACC.BLOCK.FROM/TILL/NOTES`, `CONSENT.GIVEN`.
  - nhóm expiry/status: `EXPIRY.PERIOD`, `EXPIRY.DATE`, `CONSENT.STATUS`, `LAST.ACTION.DATE`.
- Chốt từ `VALIDATE`:
  - designer validate `EXPIRY.PERIOD`.
  - arrangement validate TPP reference qua `F.PZ.OPEN.BANKING.DIR.ALTERNATE.ID`.
  - validate/default account blocks, expiry date, signup service, consent status, default account ids.
- Chốt từ `UPDATE`:
  - `UNAUTH` expand granular consent types bằng `PZ.Consent.PzGetGranularConsent(...)`.
  - `AUTH` update TPP XREF, set `valid` status, set/reset `CONSENT.ID`, schedule expiry activity và close-arrangement activity.
  - nhánh duplicate update thẳng `F.AA.ARR.ACCOUNT.CONSENT`.
- Chốt từ `EXPIRE`:
  - auth path set status `expired` nếu `EXPIRY.DATE` rơi vào khoảng hôm nay đến trước next working day.
  - update lại TPP XREF.
- Chốt từ `CLOSE`:
  - auth path update TPP XREF cho consent close nếu effective date không vượt period end.

#### ACTIVITY.API
- Source đã đọc:
  - `T24.BP/AA.ACTIVITY.API.FIELDS.b`
  - `T24.BP/AA.ACTIVITY.API.VALIDATE.b`
- Chốt từ `FIELDS`:
  - bộ key gồm `ACTIVITY.CLASS/ACTIVITY.ID`, `PROPERTY.CLASS/PROPERTY`, `PC.ACTION`.
  - bộ routines gồm `PRE.ROUTINE`, `POST.ROUTINE`, `RECORD.RTN`, `VALIDATE.RTN`, `PRE.VALIDATE.RTN`.
- Chốt từ `VALIDATE`:
  - bắt buộc phải có một trong activity class/activity id và một trong property class/property.
  - không cho nhập đồng thời class và id.
  - build list `ACTIVITY.CLASS*ACTIVITY.ID*PROPERTY.CLASS*PROPERTY*ACTION` để check duplicate.
  - validate action qua `AA.Framework.ValidateAction(...)`.
  - check duplicate conditions và duplicate routines.

#### ACTIVITY.MAPPING
- Source đã đọc:
  - `T24.BP/AA.ACTIVITY.MAPPING.FIELDS.b`
  - `T24.BP/AA.ACTIVITY.MAPPING.UPDATE.b`
  - `T24.BP/AA.ACTIVITY.MAPPING.VALIDATE.b`
- Chốt từ `FIELDS`:
  - nhóm transaction mapping: `TRANSACTION`, `TXN.SERVICE.GROUP`, `TXN.ACTIVITY`.
  - nhóm default debit/credit: `DEF.CR.ACTIVITY`, `DEF.DB.ACTIVITY`, `DEF.CR/DB.SERVICE.GROUP`.
  - nhóm event mapping: `EVENT.REF`, `EVENT.ACTIVITY`, `EVENT.SERVICE.GROUP`, `DEF.EVENT.ACTIVITY`, `DEF.EVENT.SERVICE.GROUP`.
- Chốt từ `UPDATE`:
  - `UNAUTH`, `DELETE`, `REVERSE` chỉ gọi `AA.Framework.UpdateChangeCondition()`.
- Chốt từ `VALIDATE`:
  - validate financial mapping bằng `AA.Framework.ValidateAllowedActivity(...)`.
  - transaction codes phải unique.
  - arrangement level bắt buộc `DEF.EVENT.ACTIVITY` nếu product có facility property.

#### ACTIVITY.MESSAGING
- Source đã đọc:
  - `T24.BP/AA.ACTIVITY.MESSAGING.FIELDS.b`
  - `T24.BP/AA.ACTIVITY.MESSAGING.UPDATE.b`
  - `T24.BP/AA.ACTIVITY.MESSAGING.SEND.MESSAGE.b`
  - `T24.BP/AA.ACTIVITY.MESSAGING.VALIDATE.b`
  - `T24.BP/AA.ACTIVITY.MESSAGING.RECORD.b`
- Chốt từ `FIELDS`:
  - `ADVICE`, `ACTIVITY.CLASS`, `ACTIVITY.ID`, `MSG.CONTENT`, `ROLE`, `SEND.ADVICE`, `PRE.NOTICE.ACTIVITY`, `PRE.NOTICE.DAYS`.
- Chốt từ `VALIDATE`:
  - default `SEND.ADVICE = YES`, `MSG.CONTENT = ALL`.
  - nếu có cả activity class và activity id thì phải khớp nhau.
  - `PRE.NOTICE.ACTIVITY` phải thuộc loại scheduled phù hợp; arrangement level sẽ tạo system activity `...*PRE.NOTICE`.
  - role field duplicate/null checked.
- Chốt từ `RECORD`:
  - nếu công ty không cài `DE`, field `ADVICE` bị set `NOINPUT`.
- Chốt từ `UPDATE`:
  - với new/update arrangement, routine lấy next scheduled date của `PRE.NOTICE.ACTIVITY`, tính pre-notice date rồi amend `AA.SCHEDULED.ACTIVITY`.
  - sau đó gọi `AA.Framework.UpdateChangeCondition()`.
- Chốt từ `SEND.MESSAGE`:
  - build handoff record gồm arrangement, AAA, account details, header, customer, account, property names và property records.
  - chỉ process khi role customer phù hợp và `SEND.ADVICE = YES`.

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

## Batch tiếp theo ngoài nhóm lõi

### PAYOFF

#### Source vừa xác nhận
- `T24.BP/AA.PAYOFF.FIELDS.b`
- `T24.BP/AA.PAYOFF.CALCULATE.b`
- `T24.BP/AA.PAYOFF.ISSUE.b`
- `T24.BP/AA.PAYOFF.SETTLE.b`
- `T24.BP/AA.PAYOFF.APPLY.PAY.b`
- `T24.BP/AA.PAYOFF.CANCEL.b`
- `T24.BP/AA.PAYOFF.SETTLE.ALL.b`
- `T24.BP/AA.PAYOFF.DELETE.PAYOFF.BILL.b`
- `T24.BP/AA.PAYOFF.UPDATE.b`

#### Field group vừa chốt từ `FIELDS`
- `EXPIRY.DAYS`
  - số ngày làm việc hiệu lực của payoff bill trước khi phải cancel.
- `SETTLE.ACT`
  - activity thứ cấp dùng để xử lý settle payoff từ payment module.
- `SETTLE.DUES`
  - cờ quyết định payoff có kéo luôn các dues cần settle hay không.
- `SETTLE.DUE.ACT`
  - activity dùng riêng cho settle dues đi cùng payoff.
- `TOLERANCE.PERCENT`, `TOLERANCE.CCY`, `TOLERANCE.AMOUNT`, `TOLERANCE.ACTION`
  - bộ field tolerance cho chênh lệch payoff; action hiện thấy hỗ trợ `WRITE.OFF`.

#### Action đã chốt
- `CALCULATE`
  - tạo payoff bill bằng cách gom tất cả bill chưa settle và tính các payment type đặc biệt:
    - `PAYOFF$CURRENT`
    - `PAYOFF$DUE`
    - `PAYOFF$OVERDUE`
    - `PAYOFF$PERDIEM`
    - `PAYOFF$PAY`
    - `PAYOFF$INV.DUE`
  - đọc `AA.BILL.DETAILS`, `AA.ACCOUNT.DETAILS`, current balances của `ACCOUNT`, `INTEREST`, `CHARGE`
  - reverse path xóa payoff bill đang có qua `AA.Payoff.DeletePayoffBill(...)`
- `ISSUE`
  - lấy payoff bill từ simulation hoặc live
  - nếu cần thì xóa payoff bill live cũ trước
  - ghi payoff bill vào live bằng `AA.PaymentSchedule.UpdateBillDetails(...)`
  - cập nhật amount property trên bill bằng `AA.PaymentSchedule.UpdateBillPropertyAmount(...)`
  - schedule `CANCEL-PAYOFF` trên expiry date bằng `AA.Framework.SetScheduledActivity(...)`
  - với facility/sub-arrangements còn trigger secondary `ISSUE-PAYOFF`
- `SETTLE`
  - nếu không phải initiated bởi `USER` hoặc `SCHEDULED*EOD`, routine lấy payoff info bill rồi tự chọn activity `DEBIT.SETTLE` hoặc `CREDIT.SETTLE`
  - dựng `AAA.REC` với transaction amount, local amount, linked activity
  - append secondary activity qua `AA.Framework.SecondaryActivityManager(...)`
  - cộng thêm offset amount bằng `AA.Payoff.GetPayoffOffsetAmount(...)`
- `APPLY.PAY`
  - routine riêng để cập nhật repayment reference cho các pay bills hiện có trong quá trình payoff
- `CANCEL`
  - invalidate payoff bill khi quá hạn
  - xóa payoff bill/update account details liên quan
- `UPDATE`
  - wrapper chỉ dùng để track change condition payoff

### CLOSURE

#### Source vừa xác nhận
- `T24.BP/AA.CLOSURE.FIELDS.b`
- `T24.BP/AA.CLOSURE.VALIDATE.b`
- `T24.BP/AA.CLOSURE.UPDATE.b`
- `T24.BP/AA.CLOSURE.UPDATE.GUARD.b`
- `T24.BP/AA.CLOSURE.CLOSE.b`
- `T24.BP/AA.CLOSURE.EVALUATE.b`

#### Field group vừa chốt từ `FIELDS`
- `CLOSURE.TYPE`
  - kiểu đóng arrangement: `MATURITY`, `BALANCE`, `DEFER.CLOSURE`.
- `CLOSURE.PERIOD`
  - khoảng thời gian dùng để xác định khi nào arrangement phải đóng.
- `CLOSURE.METHOD`
  - cách đóng là `MANUAL` hoặc `AUTOMATIC`.
- `POSTING.RESTRICT`
  - posting restriction sẽ được đẩy sang `ACCOUNT.CLOSURE`.
- `CLOSURE.ACTIVITY`
  - activity AA transaction hợp lệ để thực hiện manual closure.
- `CLOSE.ONLINE`
  - cờ đóng trực tiếp online khi dues đã settle.
- `COOLING.PERIOD`, `COOLING.DATE.ADJ`
  - bộ field xác định cooling period và cách điều chỉnh ngày cooling.
- `DEFER.CLOSURE.PERIOD`
  - số kỳ hoãn closure; field này `NOCHANGE`.
- `COOLING.WAIVE.CLASS`, `COOLING.WAIVE.PROP`, `WAIVE.BILL.TYPE`
  - bộ field chỉ ra class/property/bill type được waive trong cooling period.

#### Action đã chốt
- `CLOSE`
  - lấy linked account bằng `AA.Framework.GetArrangementAccountId(...)`
  - gọi `AA.Closure.DetermineDueAmount(...)` để xác định `DUE.SETTLED`
  - với `ACCOUNTS` direct closure còn gọi `AA.Payoff.ValidateAccountClosure(...)`
  - nếu pass, routine build `ACCOUNT.CLOSURE` record:
    - `AclClosureReason`
    - `AclClosureNotes`
    - `AclPostingRestrict`
    - `AclCloseOnline`
  - input stage có thể validate/tạo `ACCOUNT.CLOSURE`, auth stage có thể create zero-auth closure record
  - auth còn gọi:
    - `AA.Settlement.SettlementBlockClosureUpdate(...)`
    - maintain beneficiary links
    - update CRA details
    - update bundle hierarchy details
    - trigger dormancy check/reset
    - build secondary `MATURE` activity nếu còn total commitment
- `EVALUATE`
  - đọc `AA.ACCOUNT.DETAILS`
  - xác định có queue invalid nào không, có defer closure date hay không
  - gọi `AA.Closure.DetermineClosureRestriction(...)`
  - nếu `CLOSURE.METHOD = AUTOMATIC` thì update `AA.SCHEDULED.ACTIVITY` của `CLOSE-ARRANGEMENT`
  - với `CLOSURE.METHOD = MANUAL`, source comment cho thấy có thể update scheduled activity của `ACCOUNTS-CLOSE-ARRANGEMENT`
  - không chạy khi effective date còn nhỏ hơn `DEFER.CLOSURE.DATE`
- `UPDATE.GUARD`
  - guard method cho `UPDATE`, dùng để chặn trigger update closure ở các activity không cần chạy
- `UPDATE`
  - wrapper update condition cho property class closure

### PAYOUT.RULES

#### Source vừa xác nhận
- `T24.BP/AA.PAYOUT.RULES.FIELDS.b`
- `T24.BP/AA.PAYOUT.RULES.VALIDATE.b`
- `T24.BP/AA.PAYOUT.RULES.UPDATE.b`
- `T24.BP/AA.PAYOUT.RULES.ALLOCATE.b`

#### Field group vừa chốt từ `FIELDS`
- `APPLICATION.TYPE`
  - loại payout rule, check sang `AA.PAYMENT.RULE.TYPE`.
- `APPLICATION.ORDER`
  - thứ tự apply payout, ví dụ `OLDEST.FIRST`, `OLDEST.LAST`.
- `SEQUENCE`
  - thứ tự xử lý trong cùng rule.
- `PROPERTY`
  - property đích sẽ nhận payout amount.
- `BALANCE.TYPE`
  - balance type cụ thể dưới property đích.
- `PROP.APPL.TYPE`
  - hiện source cho thấy dùng option `BALANCES`.
- `PRE.BILL.ACTIVITY`
  - reserved cho pre-bill flow.
- `REMAINDER.ACTIVITY`
  - activity xử lý phần payout còn dư.

#### Action đã chốt
- `ALLOCATE`
  - lấy payout amount từ AAA hiện tại, cả amount LCY và exchange rate
  - gọi `AA.PaymentRules.AllocatePaymentAmount(...)` để phân bổ payout vào:
    - `BILL.REFERENCE`
    - `BILL.PROPERTY`
    - `BILL.PROPERTY.DUE.AMOUNT`
    - `BILL.PROPERTY.PAYOUT.AMOUNT`
    - `REMAINDER.AMOUNT`
    - `BILL.PROPERTY.AMOUNT.LCY`
  - ghi lại payout amount vào bill bằng `AA.PayoutRules.UpdateBillPaymentAmounts(...)`
  - nếu còn remainder:
    - dựng `AAA.REC`
    - set `ArrActTxnAmount`, `ArrActTxnAmountLcy`, `ArrActTxnExchRate`
    - append activity remainder qua `AA.Framework.SecondaryActivityManager(...)`
  - nếu có `DISBURSEMENT.BILL.AMT`, routine còn build secondary `AUTO.DISBURSE`
- `UPDATE`
  - wrapper update condition cho payout rules

### OVERDUE

#### Source vừa xác nhận
- `T24.BP/AA.OVERDUE.FIELDS.b`
- `T24.BP/AA.OVERDUE.VALIDATE.b`
- `T24.BP/AA.OVERDUE.UPDATE.b`
- `T24.BP/AA.OVERDUE.CHANGE.STATUS.b`
- `T24.BP/AA.OVERDUE.AGE.CAP.BILLS.b`

#### Field group vừa chốt từ `FIELDS`
- `BILL.TYPE`
  - loại bill mà overdue definition áp dụng.
- `OVERDUE.STATUS`
  - status overdue lấy từ virtual table `AA.OVERDUE.STATUS`.
- `AGEING.TYPE`
  - cách ageing theo `DAYS` hay `BILLS`.
- `AGEING`
  - ngưỡng ngày hoặc logic age tương ứng với status.
- `NOTICE.DAYS`, `NOTICE.FREQ`
  - số ngày và tần suất gửi notice/chaser.
- `MANUAL.CHANGE`
  - cờ đổi manual, hiện được `NOINPUT`.

#### Action đã chốt
- `CHANGE.STATUS`
  - input stage đọc `AA.ACCOUNT.DETAILS`, lấy từng `BILL.TYPE` trong property overdue, rồi xác định ageing method
  - với `APPLYPAYMENT`, `ADJUST.BILL`, `ADJUST.ALL`, `WRITE.OFF`, `WRITE.OFF.BILL`:
    - lấy các bill đã repay hoặc adjusted
    - kiểm tra có phải recalculate age status không
    - tính `NEW.AGING.STATUS`
    - update bill/account details
  - với `UPDATE-OVERDUE`:
    - lấy bill unpaid
    - tính lại ageing status theo setup overdue mới
  - routine đọc bill qua `AA.PaymentSchedule.GetBill(...)`, `GetBillDetails(...)`
  - update bill bằng `AA.PaymentSchedule.UpdateBill(...)`
  - nếu cần, append secondary activity `AGE-OVERDUE*<status>*<billtype>` và `RESUME`
  - cuối cùng ghi lại `AA.ACCOUNT.DETAILS` và update overdue stats
- `AGE.CAP.BILLS`
  - action chuyên xử lý aging cho capitalised bills trong overdue flow

### ACCOUNTING

#### Source vừa xác nhận
- `T24.BP/AA.ACCOUNTING.FIELDS.b`
- `T24.BP/AA.ACCOUNTING.VALIDATE.b`
- `T24.BP/AA.ACCOUNTING.UPDATE.b`
- `T24.BP/AA.ACCOUNTING.ACTION.DETAILS.b`
- `T24.BP/AA.ACCOUNTING.ACTIVITY.ALLOCATE.b`
- `T24.BP/AA.ACCOUNTING.DISTRIBUTE.b`
- `T24.BP/AA.ACCOUNTING.MANAGER.b`
- `T24.BP/AA.ACCOUNTING.POST.PROCESS.b`

#### Field group vừa chốt từ `FIELDS`
- `PROPERTY`
  - property có setup accounting riêng.
- `ACCT.ACTION`
  - action trong property cần map accounting rule.
- `ACCT.RULE`
  - allocation rule của soft accounting, check sang `AC.ALLOCATION.RULE`.
- `BOOKING.CM`, `BOOKING.PM`, `BOOKING.PY`
  - booking category cho current month, previous month, previous year.
- `NEG.BOOKING.CM`, `NEG.BOOKING.PM`, `NEG.BOOKING.PY`
  - booking category riêng cho accrual âm.
- `CHARGEOFF.CATEGORY`, `CHGOFF.SPECIAL.INCOME`
  - category accounting cho chargeoff.
- `ACCRUE.AMORT`, `ACCRUE.PERIOD`
  - setup accounting cho accrual/amort.

#### Action đã chốt
- `MANAGER`
  - routine trung tâm build accounting entries cho AA
  - kiểm tra arguments `TYPE`, `PROPERTY`, `ACTION`, `DATE`
  - nếu property class là `INTEREST` thì đọc property record để check `MEMO.ONLY`
  - trong batch + zero auth có thể đổi mode sang `SAO` theo context `ACCOUNTING.MODE`
  - loop từng `ACCT.EVENT.ARRAY`, kiểm tra mandatory amount/sign
  - build `EVENT.INFO`, `BASE.INFO`
  - lấy accounting details từ property `ACCOUNTING` bằng `AA.Accounting.GetAccountingDetails(...)`
  - update contra target, booking company, transaction codes
  - gọi soft accounting để hoàn tất entry
  - update local ref / our reference
  - store accounting bằng `AA.Accounting.StoreAccounting(...)`
- `ACTION.DETAILS`
  - hard-coded routine trả ra expected balance prefix, sign và subtype cho activity/action
- `ACTIVITY.ALLOCATE`
  - nhận accounting entry từ external application, map về AA activity tương ứng và net movement theo arrangement/activity
- `DISTRIBUTE`
  - quyết định entry phải đi suspense account hay AA account thật trong lớp accounting distribution
- `POST.PROCESS`
  - hậu xử lý entry list sau AA pre-processing, giữ context đúng cho nested accounting calls
- `UPDATE`
  - wrapper update condition của property accounting

### ACTIVITY.CHARGES

#### Source vừa xác nhận
- `T24.BP/AA.ACTIVITY.CHARGES.FIELDS.b`
- `T24.BP/AA.ACTIVITY.CHARGES.VALIDATE.b`
- `T24.BP/AA.ACTIVITY.CHARGES.UPDATE.b`
- `T24.BP/AA.ACTIVITY.CHARGES.CALCULATE.b`
- `T24.BP/AA.ACTIVITY.CHARGES.CALCULATE.COMM.b`
- `T24.BP/AA.ACTIVITY.CHARGES.CALCULATE.GUARD.b`

#### Field group vừa chốt từ `FIELDS`
- `ACTIVITY.ID`
  - activity sẽ bị áp activity charge.
- `CHARGE`
  - property charge sẽ được raise khi activity này xảy ra.
- `APP.PERIOD`
  - kỳ áp charge.
- `APP.METHOD`
  - cách áp charge: `DUE`, `CAPITALISE`, `DEFER`, `PAY`.
- `CHARGE.AUTO.SETTLE`
  - cờ auto settle riêng cho từng charge property.
- `PAYMENT.TYPE`
  - payment type đi cùng activity charge.
- `SETTLE.ACTIVITY`
  - activity settlement dùng cho activity charge.
- `AUTO.SETTLE`
  - cờ auto settle ở cấp activity charge.
- `SYS.*`
  - nhóm system-generated activity/charge/method/auto-settle, đều `NOINPUT`.

#### Action đã chốt
- `CALCULATE`
  - lấy `AAA.ID`, arrangement id, effective date, `R.NEW`
  - tìm activity hiện tại trong property `ACTIVITY.CHARGES`
  - với từng charge:
    - đọc `CHARGE.ID`, `APP.PERIOD`, `APP.METHOD`, `PAYMENT.TYPE`
    - nếu đang `SETTLE-PAYOFF` trong cooling period thì gọi `AA.Closure.CheckClosureCoolingWaiver(...)`
    - nếu không bị waive thì gọi `AA.ActivityCharges.AddChargeDetails(...)` để ghi charge vào `AA.CHARGE.DETAILS`
  - delete/reverse path:
    - xóa charge details qua `AA.ActivityCharges.ProcessChargeDetails(..., "DELETE", ...)`
    - nếu charge là handoff charge thì xóa handoff data qua `AA.Framework.ProcessChargeHandoffDetails(..., "REMOVE", ...)`
    - nếu `NEW` arrangement bị reverse thì xóa luôn evaluation details bằng `AA.PricingRules.EvaluationDetailsDelete(...)`
- `CALCULATE.GUARD`
  - guard method cho calculate
- `CALCULATE.COMM`
  - helper/common routine cho calculate
- `UPDATE`
  - wrapper update condition của activity charges

### Batch tiếp theo đang đưa lên web

#### Source vừa xác nhận
- `T24.BP/AA.CHARGEOFF.FIELDS.b`
- `T24.BP/AA.CHARGEOFF.UPDATE.b`
- `T24.BP/AA.CHARGEOFF.EVALUATE.b`
- `T24.BP/AA.CHARGEOFF.ALLOCATE.PAYMENT.b`
- `T24.BP/AA.CHARGEOFF.FULL.AMOUNT.ALLOCATE.b`
- `T24.BP/AA.CHANGE.PRODUCT.FIELDS.b`
- `T24.BP/AA.CHANGE.PRODUCT.UPDATE.b`
- `T24.BP/AA.CHANGE.PRODUCT.REMOVE.b`
- `T24.BP/AA.LIMIT.FIELDS.b`
- `T24.BP/AA.LIMIT.UPDATE.b`
- `T24.BP/AA.LIMIT.CHANGE.b`
- `T24.BP/AA.PAYMENT.PRIORITY.FIELDS.b`
- `T24.BP/AA.PAYMENT.PRIORITY.UPDATE.b`
- `T24.BP/AA.PAYMENT.PRIORITY.ALLOCATE.b`
- `T24.BP/AA.PRODUCT.BUNDLE.FIELDS.b`
- `T24.BP/AA.PRODUCT.BUNDLE.UPDATE.b`
- `T24.BP/AA.PRODUCT.BUNDLE.CHECK.LINKS.b`
- `T24.BP/AA.PRODUCT.BUNDLE.CLOSE.b`
- `T24.BP/AA.PRODUCT.BUNDLE.UPDATE.LIVE.DATE.b`
- `T24.BP/AA.PROPERTY.CONTROL.FIELDS.b`
- `T24.BP/AA.PROPERTY.CONTROL.UPDATE.b`
- `T24.BP/AA.PRICING.RULES.FIELDS.b`
- `T24.BP/AA.PRICING.RULES.UPDATE.b`
- `T24.BP/AA.PRICING.RULES.REMOVE.b`
- `T24.BP/AA.PRICING.GRID.FIELDS.b`
- `T24.BP/AA.PRICING.GRID.UPDATE.b`

### CHARGEOFF

#### Field đã chốt
- `FINANCIAL.STATUS`
  - chọn bộ charge-off order theo trạng thái `PERFORMING`, `SUSPENDED`, `BOTH`.
  - `AA.CHARGEOFF.EVALUATE.b` ưu tiên locate `BOTH`; nếu không có thì gọi `AA.Framework.GetSuspendDetails(...)` để tự suy ra trạng thái đang dùng.
- `CHARGE.OFF.ORDER`
  - quy định thứ tự charge-off tăng/giảm theo `OLDEST.FIRST` hoặc `NEWEST.FIRST`.
  - field này được copy vào `CHARGEOFF.ORDER` trước khi đi xuống các routine allocate chi tiết.
- `WRITEOFF.ORDER`
  - thứ tự write-off bank-first hay bank-last.
  - mới thấy chắc ở lớp field definition.
- `APPLICATION.TYPE`
  - loại allocation rule, lookup từ `AA.PAYMENT.RULE.TYPE`.
  - validate có đọc field này để kiểm tra cấu hình allocate.
- `APPLICATION.ORDER`
  - thứ tự áp allocation rule.
- `BALANCE.PROPERTY`
  - list property bị charge-off; source allocate đếm, cắt và lặp field này để cập nhật property amounts trong bill/details.
- `BALANCE.TYPE`
  - loại bucket gắn với từng property: `BILLED`, `CURRENT`, `CHARGEOFF`.

#### Action đã chốt
- `UPDATE`
  - wrapper change-condition; các nhánh `UNAUTH`, `DELETE`, `REVERSE` chỉ gọi `AA.Framework.UpdateChangeCondition()`.
- `EVALUATE`
  - đọc `ArrActTxnAmount` từ AAA.
  - xác định chargeoff order theo financial status.
  - nhánh `UPDATE`/`REVERSE` đều đi qua `CHARGEOFF.PROCESSING`.
  - logic con đi xuống `AA.CHARGEOFF.ALLOCATE.PAYMENT.b` và `AA.CHARGEOFF.FULL.AMOUNT.ALLOCATE.b`.
- `ALLOCATE.PAYMENT` helper
  - lấy repayment amount customer-side.
  - allocate sang bank/chargeoff side.
  - update bill payment/property amounts qua `AA.PayoutRules.UpdateBillPaymentAmounts(...)`.
  - update `AA.ACTIVITY.BALANCES` cho phần remainder/special income.
- `FULL.AMOUNT.ALLOCATE` helper
  - gọi `AA.ChargeOff.CreateChargeoffDetails(...)`.
  - đọc bill `CHARGEOFF`, lấy `AA.BILL.DETAILS`, rồi gọi `AA.ChargeOff.UpdateChargeoffAmounts(...)` cho từng bill property.
  - reverse path còn gọi `AA.ChargeOff.UpdateChargeoffDetails(..., "FULL.CHARGEOFF", ...)`.

### CHANGE.PRODUCT

#### Field đã chốt
- `CHANGE.DATE.TYPE`
  - chọn giữa ngày tương đối theo kỳ và ngày nhập trực tiếp.
- `CHANGE.PERIOD`
  - kỳ tương đối để tính renewal/change date.
- `CHANGE.DATE`
  - ngày đổi sản phẩm cố định.
- `CHANGE.ACTIVITY`
  - activity sẽ được schedule để chạy đổi sản phẩm.
- `PRIOR.DAYS`
  - số ngày chạy sớm hơn ngày đổi sản phẩm.
- `CHG.TO.PRODUCT`
  - product đích.
- `ALLOWED.PRODUCT`
  - whitelist product được phép đổi sang.
- `INITIATION.TYPE`
  - `AUTO` hoặc `MANUAL`.
- `DEFAULT.ACTIVITY`
  - activity fallback khi không dùng `CHANGE.ACTIVITY`.

#### Action đã chốt
- `UPDATE`
  - orchestration chính của change product.
  - gọi `AA.Framework.SetScheduledActivity(...)` để add/cycle/delete renewal hoặc change-product activity trong `AA.SCHEDULED.ACTIVITY`.
  - cập nhật `AA.ACCOUNT.DETAILS` ở label `UPDATE.ACCOUNT.DETAILS`.
  - cập nhật `AA.ARRANGEMENT` ở flow `DO.ARRANGEMENT.UPDATE`.
  - cập nhật amortisation ở `UPDATE.AMORTISATION.DETAILS`.
- `REMOVE`
  - dùng khi product mới không còn property change-product hoặc khi reverse/delete.
  - gọi `AA.ChangeProduct.ChangeProductBundleValidation(...)`.
  - lấy renewal activity kế tiếp bằng `AA.Framework.GetScheduledActivityDate(...)`.
  - dọn `AA.SCHEDULED.ACTIVITY`, xóa renewal date trong `AA.ACCOUNT.DETAILS`, và cập nhật lại product details/amortisation.

### LIMIT

#### Field đã chốt
- `LIMIT.REFERENCE` + `LIMIT.SERIAL`
  - ghép thành limit reference thật dùng cho API limit.
- `LIMIT.AMOUNT`
  - amount hạn mức danh nghĩa.
- `EXPIRY.DATE`
  - ngày hết hiệu lực; source còn tính lại old/new expiry theo tenor.
- `MANAGE.LIMIT`
  - quyết định AA tự quản lý limit hay không.
- `OD.STATUS`, `OD.PERIOD`, `SUSPEND`, `NOTICE.FREQUENCY`, `POSTING.RESTRICT`
  - cụm cấu hình overdraft của limit.
- `CREDIT.CHK.CONDITION`, `CREDIT.CHK.TXN.TYPE`
  - cover/credit check control.
- `USE.SECONDARY.LIMIT`, `SECONDARY.LIMIT.AMT`
  - fallback sang hạn mức phụ.
- `LIMIT`
  - internal limit key.
- `VALIDATION.LIMIT`
  - id dùng cho bảng `ValidationLimitContracts`.

#### Action đã chốt
- `UPDATE`
  - dựng `OLD.LIMIT.REF`, `NEW.LIMIT.REF`, `NEW.LAST.LIMIT.REF`.
  - tính `OLD/NEW.EXPIRY.DATE` bằng `AA.Framework.DetermineTenorExpiryDate(...)`.
  - gọi `AA.Limit.ProcessLimitChange(...)` ở `UNAUTH`, `DELETE`, `AUTH`.
  - với DEAL + `VALIDATION.LIMIT`, gọi `LI.Config.LiUpdateLinkedContracts(...)`.
  - facility under deal có thể chạy `AUTOMATIC.UTILISED.LIMIT.PROCESS`.
- `CHANGE`
  - xử lý đổi owner/customer hoặc thay binding limit.
  - kiểm tra limit record hiện hữu.
  - nếu `LIMIT.SERIAL = NEW` hoặc không đọc được record cũ thì set nhánh tạo limit mới.

### PAYMENT.PRIORITY

#### Field đã chốt
- `APPLICATION.TYPE`
  - payment rule type điều khiển allocate.
- `PRIORITY.RULE`
  - rule sort drawings/bills.
- `PRIORITY.RULE.LIST`
  - detail list của từng priority rule.
- `REMAINDER.PAY.ACTIVITY`
  - activity xử lý phần tiền dư sau allocate.
- `ADVANCE.PAYMENT.METHOD`
  - `PARTIAL` hoặc `FULL`.
- `ADVANCE.PAYMENT.RESTRICTION`
  - ràng buộc advance payment.

#### Action đã chốt
- `ALLOCATE`
  - đọc rule hiệu lực bằng `GetFinancialAllocationRule(...)` và `GetPaymentRuleType(...)`.
  - lấy drawings qua `AA.PaymentPriority.GetDrawingsArrangementDetails(...)`.
  - nếu bill-based thì lấy bill qua `AA.PaymentPriority.GetDrawingsBillDetails(...)`.
  - sort bằng `AA.PaymentPriority.SortDrawingsByRules(...)`.
  - lấy due amounts bằng `AA.PaymentPriority.GetPropertyDueAmount(...)`.
  - allocate bằng `AA.PaymentPriority.AllocateDrawingsRepaymentAmount(...)`.
  - update `AA.ACTIVITY.BALANCES` qua `AA.Framework.ProcessActivityBalances(...)` + `UpdateActivityBalances(...)`.
  - apply payment trên từng drawing qua `AA.PaymentPriority.ApplyPaymentPriority(...)`.
  - remainder tạo AAA phụ bằng `AA.Framework.SecondaryActivityManager(...)`.
  - delete/reverse path gọi `AA.PayoutRules.UpdateBillPaymentAmounts(..., "REVERSE", ...)`.
- `UPDATE`
  - wrapper change-condition, giống pattern update property đơn giản.

### PRODUCT.BUNDLE

#### Field đã chốt
- `BUNDLE.CONSTITUTION`
  - kiểu cấu thành bundle.
- `PRODUCT.GROUP`, `PRODUCT`
  - nhóm product và product được phép nằm trong bundle.
- `MINIMUM`, `MAXIMUM`
  - giới hạn số participant.
- `ARRANGEMENT`, `ARR.CURRENCY`
  - participant arrangement và currency của từng participant.
- `ARR.INFO.ONLY`
  - cờ participant chỉ để tham chiếu.
- `MASTER.ARRANGEMENT`, `MASTER.TYPE`
  - arrangement/property master của bundle.
- `PARTICIPANT.OWNER`, `PARTICIPANT.CURRENCY`
  - rule lọc participant theo owner/currency.
- `REFERENCE.CCY`, `LIMIT.TYPE`, `MASTER.ACC.NAME`, `MASTER.LIVE.DATE`
  - nhóm field phục vụ draft/pool administration/live-date.

#### Action đã chốt
- `UPDATE`
  - lấy `R.NEW`, `R.OLD` hoặc previous property record.
  - gọi `AA.ProductBundle.UpdateArrangementBundleLink(...)` để update link bundle trên bundle arrangement và donor/recipient arrangements.
- `CHECK.LINKS`
  - đọc product-level `PROPERTY.CONTROL` và `BUNDLE.HIERARCHY`.
  - dùng `AA.Framework.DetermineNullArray(...)` để biết có definition thật không.
  - trả cờ online/offline processing.
- `CLOSE`
  - lock từng arrangement participant.
  - chèn hoặc xóa `ArrLinkDate/Type/Arrangement/Property/ArrangementType`.
  - ghi lại `AA.ARRANGEMENT` bằng `AA.Framework.ArrangementWrite(...)`.
  - auth path xử lý thêm `AC.BLOCK.CLOSURE`.
- `UPDATE.LIVE.DATE`
  - gom `MASTER.LIVE.DATE` và participant `LIVE.DATE`.
  - remove duplicate.
  - ghi pool administration list bằng `AB.Framework.UpdatePoolAdministrationList(...)`.

### PROPERTY.CONTROL

#### Field đã chốt
- `PRODUCT.GROUP`, `PRODUCT`
  - điều kiện lọc arrangement theo product/product group.
- `PROPERTY.CLASS`, `PROPERTY`
  - scope property hoặc class cần áp control.
- `CURRENCY`
  - điều kiện đồng tiền.
- `PROPERTY.CONDITION`
  - condition sẽ bị áp lại.
- `CONTROL.MASTER`, `CONTROL.SECONDARY`
  - cách xử lý cho master và secondary arrangement.
- `SOURCE.PRODUCT`
  - product nguồn sinh ra property control; `NOINPUT`.

#### Action đã chốt
- `UPDATE`
  - auth path đọc record `PRODUCT.BUNDLE` hiện tại bằng `AA.ProductFramework.GetPropertyRecord(...)`.
  - đọc previous bundle bằng `AA.Framework.GetPreviousPropertyRecord(...)`.
  - so sánh thay đổi arrangement/info-flag bằng `AA.Framework.DetermineChangeValues(...)`.
  - với từng arrangement thay đổi, đọc product bằng `AA.Framework.GetArrangementProduct(...)`.
  - nếu match rule control thì gọi `AA.Framework.ManageExternalActivities(...)` để append/update `APPLY.PC.CHANGE`.

### PRICING.RULES

#### Field đã chốt
- `PLAN.SELECT.METHOD`, `PLAN.SELECT.TYPE`, `PLAN.SELECT.PROPERTY`
  - cụm chọn pricing plan.
- `PLAN.RESET.FREQ`, `PLAN.RESET.ON.ACT`
  - cụm reset pricing plan.
- `PROGRAM.LIMIT`, `SELECTED.PROGRAM`, `PRICING.PROGRAM`
  - cụm program selection.
- `RULE.NAME`, `RULE.SOURCE`, `RULE.VALUE`
  - rule evaluation input.
- `PRICING.BENEFIT`, `PRICING.PROPERTY`, `TRIGGER`, `EVALUATION.RESULT`
  - cụm benefit/property chịu tác động.

#### Action đã chốt
- `UPDATE`
  - đọc property `ACCOUNT` để lấy `DATE.CONVENTION`, `DATE.ADJUSTMENT`, `BUS.DAYS`.
  - gọi `AA.Rules.GetRecalcDate(...)` để tính `NEXT.CYCLED.DATE`.
  - ghi `AA.SCHEDULED.ACTIVITY` cho `PLAN.RESET` bằng `AA.Framework.SetScheduledActivity(...)`.
  - nếu property pricing bị xóa khỏi record mới, dựng `CLEAR.ASSESSMENT` AAA phụ và append qua `AA.Framework.SecondaryActivityManager(...)`.
  - new arrangement còn có thể dựng `POST.ASSESSMENT` secondary activity.
- `REMOVE`
  - input path xóa `PLAN.RESET` schedule hiện có.
  - reverse/delete path đọc property cũ rồi amend lại `PLAN.RESET`.

### PRICING.GRID

#### Field đã chốt
- `CRITERION.ID`
  - data element id của tiêu chí.
- `TARGET.ID`
  - target element nhận output của grid.
- `DEFAULT`
  - giá trị fallback của grid.
- `TIER.TYPE`
  - `SINGLE`, `LEVEL`, `BAND`.
- `CRITERION.1..10`
  - giá trị criterion tương ứng từng criterion id.
- `TARGET.1..10`
  - giá trị output của từng tier/band.

#### Action đã chốt
- `UPDATE`
  - đọc `GridCriterionId` và `GridCriterion1..10` từ `R.NEW`.
  - với criterion type `PROPERTY`, gom property duy nhất bằng `AA.Framework.DataElements.Read(...)`.
  - ghi reference details qua `AA.Framework.UpdateReferenceDetails(...)` với `UpdateType = "PRICING.GRID"`.
  - đọc old/new source-target property bằng `AA.PricingGrid.GetSourceAndTargetProperty(...)`.
  - nếu mapping đổi, gọi `AA.PricingGrid.UpdateArrangementGridLink(...)` để remove/add arrangement links.
  - nếu level = 1 thì gọi `AA.PricingGrid.UpdateCustomerGridLink(...)` để add/delete customer links.

### Batch tiếp theo

#### Source vừa xác nhận
- `T24.BP/AA.BUNDLE.HIERARCHY.FIELDS.b`
- `T24.BP/AA.BUNDLE.HIERARCHY.UPDATE.b`
- `T24.BP/AA.BUNDLE.HIERARCHY.HANDOFF.b`
- `T24.BP/AA.BUNDLE.HIERARCHY.HANDOFF.DETAILS.b`
- `T24.BP/AA.BUNDLE.HIERARCHY.DATA.CAPTURE.b`
- `T24.BP/AA.BUNDLE.HIERARCHY.FUNCTION.b`
- `T24.BP/AA.INTEREST.COMPENSATION.FIELDS.b`
- `T24.BP/AA.INTEREST.COMPENSATION.UPDATE.b`
- `T24.BP/AA.INTEREST.COMPENSATION.CLOSE.b`
- `T24.BP/AA.PARTICIPANT.FIELDS.b`
- `T24.BP/AA.PARTICIPANT.UPDATE.b`
- `T24.BP/AA.PARTICIPANT.ALLOCATE.PAYMENT.b`
- `T24.BP/AA.FACILITY.FIELDS.b`
- `T24.BP/AA.FACILITY.UPDATE.b`
- `T24.BP/AA.FACILITY.EVALUATE.b`
- `T24.BP/AA.FACILITY.CHECK.PRODUCT.b`
- `T24.BP/AA.SUB.ARRANGEMENT.CONDITION.FIELDS.b`
- `T24.BP/AA.SUB.ARRANGEMENT.CONDITION.UPDATE.b`
- `T24.BP/AA.SUB.ARRANGEMENT.RULES.FIELDS.b`
- `T24.BP/AA.SUB.ARRANGEMENT.RULES.UPDATE.b`
- `T24.BP/AA.SUB.LIMITS.FIELDS.b`
- `T24.BP/AA.SUB.LIMITS.UPDATE.b`
- `T24.BP/AA.TERM.AMOUNT.FIELDS.b`
- `T24.BP/AA.TERM.AMOUNT.UPDATE.b`
- `T24.BP/AA.TERM.AMOUNT.DRAW.b`
- `T24.BP/AA.TERM.AMOUNT.REDEEM.b`

### BUNDLE.HIERARCHY

#### Field đã chốt
- `ALLOWED.PRODUCT.GROUP`, `ALLOWED.PRODUCT`, `ALLOWED.PARENT`
  - rule lọc product con và parent trong bundle/pool.
- `ACCOUNT.REF`, `ACCOUNT.ALIAS`, `CUSTOMER`, `ACC.COMPANY`, `ACC.CURRENCY`, `ACC.PRODUCT`
  - bộ dữ liệu account draft/CT account sẽ được đẩy sang `AA.POOL.ORCHESTRATION.DETAILS`.
- `NEW.BUNDLE.REF`, `PARENT.ACCOUNT`
  - dữ liệu move/change pool.
- `LINK.TYPE`
  - loại thao tác pool: `LINK`, `DELINK`, `CLOSE`, `CHANGE.PARENT`, `UPDATE`, `SET.LIVE.DATE`, `CHANGE.POOL`.
- `KEEP.BALANCE`
  - giữ balance trong pool hay không.
- `LIVE.DATE`
  - ngày live của account trong bundle/pool.
- `ACC.LOCATION`
  - location của draft account cho orchestration.

#### Action đã chốt
- `UPDATE`
  - input/delete/reverse chỉ `AA.Framework.UpdateChangeCondition()`.
  - auth path đọc `R.NEW`, lấy `ACCOUNT.REF`, `LIVE.DATE`.
  - nếu live date trống thì đọc `AA.BundleHierarchy.PoolOrchestrationDetails` hiện tại hoặc bundle cũ trong cross-pool để lấy `PodLiveDate`.
  - chọn `PROCESS.TYPE` giữa `AUTH`, `PRELIMINARY.AUTH`, `PRELIMINARY.UPDATE`, `MOVE.TO.LIVE`.
  - gọi `AA.BundleHierarchy.ProcessBundleHierarchyDetails(...)`.
- `HANDOFF`
  - auth path gọi `AA.BundleHierarchy.BundleHierarchyHandoffDetails(...)`.
  - nếu routine trả warning thì store override.
  - unauth + `RESTRUCTURE` chỉ validate CT accounts; lỗi sẽ được split ra và raise trên field `BhAccountRef`.
- `HANDOFF.DETAILS`
  - build record `AA.POOL.ORCHESTRATION.DETAILS` từ field `ACCOUNT.REF` tới `LIVE.DATE`.
  - `DRAFT`: write table.
  - `RESTRUCTURE`/`SWITCH.TO.PRELIMINARY`: check CT account, build record, write table, write service list.
  - `INTEGRITY.CHECK`: write record/list riêng với status `Processing...`.
- `DATA.CAPTURE`
  - auth path gọi `BundleHierarchyHandoffDetails(..., "DRAFT", ...)`.
  - auth-rev path gọi `PoolOrchestrationDetailsDelete(...)`.
- `FUNCTION`
  - chặn function `R` cho `UPDATE-BUNDLE.HIERARCHY` khi request là browser request.

### INTEREST.COMPENSATION

#### Field đã chốt
- `RECIPIENT.PRODUCT`, `RECIPIENT.PROPERTY`
  - phía recipient được hưởng bù lãi.
- `OFFSET.TYPE`
  - offset theo `POOL` hoặc `RECIPIENT`.
- `MAX.OFFSET`
  - giới hạn offset tối đa.
- `DONOR.PRODUCT`, `DONOR.PROPERTY`
  - phía donor của compensation.
- `DONOR.ACCRUAL`
  - `CALCULATE`, `SUPPRESS`, `INFO.ONLY`.
- `DONOR.BALANCE.TYPE`
  - balance type donor.
- `DONATE.TYPE`
  - source calc type được donate.

#### Action đã chốt
- `UPDATE`
  - đọc current/old `INTEREST.COMPENSATION` và current/old `PRODUCT.BUNDLE`.
  - gọi `AA.InterestCompensation.ProductBundleCheckLinks(...)` để biết online/offline processing.
  - dùng current/old bundle để update donor/recipient link details trên `AA.ARRANGEMENT`.
  - auth/auth-rev theo comment sẽ trigger `MAINTAIN-INTEREST` qua common `UpdateInterestCompensation(...)`.
- `CLOSE`
  - khi close bundle ở `AUTH` hoặc `AUTH-REV`, gọi `AA.InterestCompensation.UpdateInterestCompensation(...)`.
  - `AUTH` sẽ set `REV.FLAG = 1` vì close được xử lý như reversal của bundle arrangement.

### PARTICIPANT

#### Field đã chốt
- `BANK.ROLE`
  - `AGENT`, `AGENT CUM PARTICIPANT`, `PARTICIPANT`.
- `OWN.COMMIT.AMT`, `OWN.COMMIT.PERC`
  - phần commitment của own bank.
- `PARTICIPANT`, `COMMITMENT.AMT`, `COMMITMENT.PERC`
  - danh sách participant cùng amount/percent của từng participant.
- `PARTICIPANT.ROLE`
  - role customer ở participant side.
- `BENEFICIARY.*`
  - dữ liệu payout/beneficiary cho participant.
- `SKIM.PROPERTY`, `MARGIN.OPER`, `MARGIN.RATE`
  - dữ liệu skim/margin participant.

#### Action đã chốt
- `UPDATE`
  - đọc balance treatment từ `AA.Account.GetAccountBalanceTreatment(...)`.
  - đọc `TERM.AMOUNT` để lấy `CurrentAmount`.
  - nếu account treatment là participation và activity là `INCREASE`, `DECREASE` hoặc new arrangement:
    - với increase/decrease, lấy amount cũ rồi tính lại pro-rata theo `CHANGE.AMOUNT`
    - validate participant
    - tính `OwnCommitAmt` và `OwnCommitPerc`
    - ghi lại các field amount/percent vào `R.NEW`
    - refresh participant common bằng `AA.Participant.SetParticipantCommon(...)`
- `ALLOCATE.PAYMENT`
  - lấy participant list từ `AA.Participant.GetParticipantsCommon(...)`.
  - lấy borrower current repayment từ `AA.ACTIVITY.BALANCES` cho `ACCOUNT` và `INTEREST`.
  - lấy borrower bill repayment từ `AA.BILL.DETAILS`.
  - chia repayment lại cho own bank và participants.
  - update `AA.ACTIVITY.BALANCES` cho participant side.

### FACILITY

#### Field đã chốt
- `SERVICE`
  - service group bật cho facility.
- `SERVICE.AVAILABILITY`
  - `AVAILABLE`, `BLOCKED`, `OPTIONAL`.
- `CUSTOMER.OPTION`
  - `OPT-IN`, `OPT-OUT`.

#### Action đã chốt
- `UPDATE`
  - wrapper `AA.Framework.UpdateChangeCondition()`.
- `EVALUATE`
  - đọc `TRANSACTION.SERVICE.GROUP` từ activity context.
  - gọi `AA.Facility.DetermineAllowedService(...)`.
  - nếu `AllowedLevel = ERROR` thì raise end error.
- `CHECK.PRODUCT`
  - locate `FL` trong company applications để biết company có bật Facility product line hay không.

### SUB.ARRANGEMENT.CONDITION

#### Field đã chốt
- `PRODUCT.LINE`, `PRODUCT.GROUP`, `PRODUCT`, `CURRENCY`
  - bộ điều kiện match sub-arrangement.
- `PROPERTY`
  - property áp condition.
- `ATTRIBUTE`, `VALUE`, `MESSAGE`
  - rule attribute và cách phản hồi `ERROR`/`OVERRIDE`.
- `PROPERTY.CLASS`, `SYS.ATTRIBUTE`, `TYPE`, `LINK`
  - field hệ thống được default tự động.

#### Action đã chốt
- `UPDATE`
  - unauth path gọi `AA.SubArrangementCondition.DetermineSubArrangementConditionLink(...)`.
  - ghi ngược `SYS.ATTRIBUTE`, `PROPERTY.CLASS`, `TYPE`, `LINK` vào `R.NEW`.

### SUB.ARRANGEMENT.RULES

#### Field đã chốt
- `CUSTOMER`, `REQUIRED.CUSTOMER`, `ALLOWED.CUSTOMER`
  - rule customer cho sub-arrangement.
- `CURRENCY`, `ALLOWED.CURRENCY`
  - rule currency.
- `PRODUCT`, `ALLOWED.PRD.GROUP`, `ALLOWED.PRODUCT`
  - rule product.
- `TERM.RECALCULATION`
  - cho phép recalc term.
- `CURRENCY.MARKET`, `EXCH.RATE.TYPE`
  - rule FX cho sub-arrangement đa tiền tệ.

#### Action đã chốt
- `UPDATE`
  - wrapper `AA.Framework.UpdateChangeCondition()`.

### SUB.LIMITS

#### Field đã chốt
- `RISK.CRITERION`
  - data element làm tiêu chí sub-limit.
- `CRITERION.1..10`
  - giá trị criterion.
- `SUB.LIMITS.CCY`
  - currency sub-limit, hiện là `FACILITY.CCY`.
- `SUB.LIMITS.AMOUNT`
  - amount sub-limit.

#### Action đã chốt
- `UPDATE`
  - `UNAUTH`/`DELETE`: nếu không phải new arrangement thì gọi `AA.SubLimits.RestrictionLimitsHandOff()`.
  - `AUTH`: nếu new arrangement hoặc `AUTH-REV` thì handoff restriction limits.
  - mọi nhánh đều update change condition.

### TERM.AMOUNT

#### Field đã chốt
- `AMOUNT`
  - commitment/principal amount hiện tại.
- `CHANGE.AMOUNT`
  - amount tăng/giảm trong activity.
- `TERM`
  - kỳ hạn.
- `REVOLVING`
  - `NO`, `PAYMENT`, `PREPAYMENT`.
- `UPDATE.COMMT.LIMIT`
  - có update facility commitment hay không.
- `MATURITY.DATE`
  - ngày đáo hạn.
- `EXPIRY.DATE`
  - ngày hết hiệu lực commitment.
- `COMMITMENT.DRAWDOWN`
  - `AUTO`, `SCHEDULE`, `MANUAL`.
- `ON.MATURITY`
  - xử lý khi maturity, ví dụ `DUE`.
- `UPDATE.UTILISATION`
  - có raise/update utilisation hay không.
- `UPDATE.COMMIT.ON.CAP`
  - cách cập nhật commitment khi repay/capitalise overdraw.
- `CANCEL.PERIOD`
  - kỳ tính cancel date.

#### Action đã chốt
- `DRAW`
  - lấy movement amount từ `AmtAmount`, xác định balance type bằng `PropertyGetBalanceName(...)`.
  - validate available commitment / limit / utilisation theo cờ update.
  - build accounting event rồi gọi `AA.Accounting.AccountingManager(...)`.
  - handoff update limit/facility commitment sang common term amount APIs.
- `REDEEM`
  - đọc `AmtAmount`, lấy balance type `TOT`, build event `DEBIT`, gọi accounting manager.
- `UPDATE`
  - update `AA.SCHEDULED.ACTIVITY`.
  - update `AA.ACCOUNT.DETAILS` cho maturity/cancel/expiry.
  - nếu tranche = yes thì update tranche activity.
  - nếu `COMMITMENT.SCHEDULE` hoặc `UNAVAILABILITY.SCHEDULE` có mặt thì gọi manager tương ứng.
