import type { PropertyClass } from "@/lib/property-data";

export const manualCoreOverrides: Record<string, PropertyClass> = {
  account: {
    name: "ACCOUNT",
    slug: "account",
    fields: [
      {
        name: "AA.AC.CATEGORY",
        slot: 3,
        details: [
          "Nhóm phân loại account nền của arrangement; validate đối chiếu sang bảng `CATEGORY`.",
          "Field này quyết định account được tạo dưới loại sản phẩm kế toán nào trước khi các action `PAY`, `REPAY`, `MAKE.DUE` chọn balance status để hạch toán."
        ]
      },
      {
        name: "AA.AC.CURRENCY",
        slot: 4,
        details: [
          "Tiền tệ chính của account và được khóa `NOCHANGE` sau khi condition đã tạo.",
          "Các action accounting của `ACCOUNT` luôn lấy currency arrangement/account này làm currency gốc khi dựng event."
        ]
      },
      {
        name: "AA.AC.ACCOUNT.TITLE.1",
        slot: 6,
        details: [
          "Tên hiển thị chính của account trên record mở tài khoản và trên output khách hàng.",
          "Routine `FIELDS` gắn metadata dữ liệu cá nhân cho field này nên nó là tên hiển thị nghiệp vụ chứ không phải cờ kỹ thuật."
        ]
      },
      {
        name: "AA.AC.ALT.ID.TYPE",
        slot: 10,
        details: [
          "Loại mã nhận diện phụ của account, ví dụ loại alternate id hoặc loại IBAN sinh thêm.",
          "Trong `AA.ACCOUNT.UPDATE.b`, routine `GET.ALT.ACCT.ID` và `GET.IBAN.NUMBER` ghi ngược lại field này sau khi gọi service sinh mã."
        ]
      },
      {
        name: "AA.AC.ALT.ID",
        slot: 11,
        details: [
          "Giá trị alternate id thực tế của account.",
          "Nếu generate IBAN hoặc generate alternate id được bật, `UPDATE` sẽ sinh lại field này và ghi thẳng vào `R.NEW`."
        ]
      },
      {
        name: "AA.AC.CUSTOMER.REFERENCE",
        slot: 12,
        details: [
          "Mã tham chiếu khách hàng gắn với account để đối soát hoặc in ấn.",
          "Field này được đánh dấu dữ liệu cá nhân trong `FIELDS`, nên đây là dữ liệu nghiệp vụ hiển thị ra ngoài thay vì tham số nội bộ."
        ]
      },
      {
        name: "AA.AC.POSTING.RESTRICT",
        slot: 13,
        details: [
          "Danh sách posting restriction áp cho account.",
          "Các flow settlement và account processing về sau đọc restriction trên account này để chặn hoặc đổi nhánh posting."
        ]
      },
      {
        name: "AA.AC.BASE.DATE.TYPE",
        slot: 27,
        details: [
          "Kiểu ngày gốc để suy ra anniversary và các kỳ schedule của account.",
          "Trong `AA.ACCOUNT.UPDATE.b`, field này được đưa vào `AA.Account.DetermineAnniversaryDate(...)` để tính lại ngày `ANNIVERSARY`."
        ]
      },
      {
        name: "AA.AC.ANNIVERSARY",
        slot: 28,
        details: [
          "Ngày kỷ niệm/cycle của account theo định dạng MMDD.",
          "Routine `UPDATE` không tin hoàn toàn vào input mà luôn có thể tính lại và ghi lại field này dựa trên `BASE.DATE.TYPE` và `EFFECTIVE.DATE`."
        ]
      },
      {
        name: "AA.AC.LIMIT.ACCOUNT",
        slot: 47,
        details: [
          "Cờ cho biết account này phải liên kết với limit arrangement.",
          "Nếu field này có giá trị, `AA.ACCOUNT.UPDATE.b` gọi `AA.Framework.UpdateArrangementLimitLink(...)` và còn có thể tạo record `ACCOUNT.DEBIT.LIMIT`."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE ACCOUNT",
        routine: "AA.ACCOUNT.UPDATE.b",
        summary: "Cập nhật condition của account, sinh mã nhận diện phụ và đồng bộ account details hoặc limit link.",
        steps: [
          "Bước 1: `PROCESS.INPUT.ACTION` đặt `PROCESS.TYPE = UPDATE`, tính lại ngày anniversary bằng `AA.Account.DetermineAnniversaryDate(...)` rồi ghi `AcAnniversary` vào `R.NEW` nếu có ngày trả về.",
          "Bước 2: `GET.ACCOUNT.NUMBER` đọc linked application `ACCOUNT` từ `RArrangement`; nếu arrangement chưa link account thì lấy `AcAccountReference` rồi gọi `AA.Account.UpdateLinkApplication(\"ACCOUNT\", ACCOUNT.NO, ...)` để gắn account vào arrangement.",
          "Bước 3: `GET.ALT.ACCT.ID` gọi `AC.AccountOpening.AcGetAltAcctId(...)`, cập nhật lại `AcAltIdType` và `AcAltId` trên `R.NEW`, đồng thời đẩy lỗi trùng/sai theo đúng vị trí field.",
          "Bước 4: nếu bật `GENERATE.IBAN = YES`, routine gọi `AC.AccountOpening.AcGetIban(...)` rồi tiếp tục ghi lại `ALT.ID.TYPE` và `ALT.ID` vừa sinh.",
          "Bước 5: nếu là new arrangement, routine gọi `AA.PaymentSchedule.ProcessAccountDetails(ARRANGEMENT.ID, PROCESS.TYPE, \"NEW\", \"\", RET.ERROR)` để cập nhật `AA.ACCOUNT.DETAILS`.",
          "Bước 6: nếu `LIMIT.ACCOUNT` có giá trị, routine gọi `AA.Framework.UpdateArrangementLimitLink(...)` để đồng bộ link limit; khi authorize còn có thể tạo hoặc cập nhật `ACCOUNT.DEBIT.LIMIT`."
        ],
        flow: [
          "Ghi `AcAnniversary`, `AcAltIdType`, `AcAltId` trực tiếp lên `R.NEW`.",
          "Cập nhật link application của arrangement qua `AA.Account.UpdateLinkApplication(...)`.",
          "Cập nhật `AA.ACCOUNT.DETAILS` gián tiếp qua `AA.PaymentSchedule.ProcessAccountDetails(...)`.",
          "Có thể ghi `ACCOUNT`, `ACCOUNT$NAU` và `ACCOUNT.DEBIT.LIMIT` khi xử lý refer limit."
        ]
      },
      {
        name: "PAY ACCOUNT",
        routine: "AA.ACCOUNT.PAY.b",
        summary: "Hạch toán payout cho phần principal của property `ACCOUNT` dựa trên bill đã được chọn sẵn.",
        steps: [
          "Bước 1: routine lấy ngữ cảnh activity hiện tại, repayment date và arrangement currency.",
          "Bước 2: đọc danh sách bill cần xử lý, lặp từng bill rồi `GET.BILL.DETAILS` để xác định `REPAY.STATUS` như `CUR`, `UNC`, `AVL` từ status bill.",
          "Bước 3: gọi `AA.PaymentSchedule.GetBillPropertyAmount(\"REPAY\", ...)` để lấy `PROPERTY.REPAY.AMOUNT` của property `ACCOUNT` trên bill đó.",
          "Bước 4: gọi `AA.ProductFramework.PropertyGetBalanceName(...)` để suy ra balance thật phải tác động, ví dụ `CUR`, `UNC`, `AVL` hoặc balance charged-off tương ứng subtype.",
          "Bước 5: gọi `AA.Accounting.GetAccountingEventType(...)`, dựng `EVENT.REC` với amount, sign, balance type, value date và contra target rồi dồn vào `MULTI.EVENT.REC`.",
          "Bước 6: gọi `AA.Accounting.AccountingManager(...)` để đẩy queue accounting theo mode `VAL`, `DEL` hoặc `AUT`."
        ],
        flow: [
          "Đọc `AA.BILL.DETAILS` để lấy status và amount của property.",
          "Không ghi bill trực tiếp trong file này.",
          "Ghi queue/accounting entry qua `AA.Accounting.AccountingManager(...)`."
        ]
      },
      {
        name: "MAKE.DUE ACCOUNT",
        routine: "AA.ACCOUNT.MAKE.DUE.b",
        summary: "Chuyển principal từ current hoặc pay sang due/payable theo bill đến hạn của payment schedule.",
        steps: [
          "Bước 1: lấy charge-off status bằng `AA.ChargeOff.GetChargeoffDetails(...)`; nếu full chargeoff thì chạy riêng cho subtype `BANK` và `CUST`.",
          "Bước 2: gán `REQD.PROCESS = VAL`, dựng các balance name `DUE`, `CUR`, `PAY`, `EXP`, `AVL`, rồi gọi `GET.BILL` để lấy bill của ngày make due.",
          "Bước 3: với từng bill, routine đọc `BILL.DETAILS`, lọc theo `BdDueReference = AAA.ID`, rồi map user bill type sang system bill type bằng `AA.PaymentSchedule.GetSysBillType(...)`.",
          "Bước 4: gọi `AA.PaymentSchedule.GetBillPropertyAmount(\"DUE\", SUB.TYPE, ...)` để lấy amount principal tới hạn của property `ACCOUNT` trên bill.",
          "Bước 5: chọn event type và cặp balance theo loại bill: bill `DUE` thì `debit DUE / contra CUR`, bill `PAY` thì `debit CUR / contra PAY`, bill `EXPECTED` thì đi balance `EXP`, bill disbursement hoặc tranche có thể đi `AVL`.",
          "Bước 6: dựng `EVENT.REC` và gửi vào `AA.Accounting.AccountingManager(...)`; nếu là kỳ trả cuối, routine còn append secondary activity `LENDING-RESIDUAL-<property>`."
        ],
        flow: [
          "Đọc `AA.BILL.DETAILS` qua `AA.PaymentSchedule.GetBill(...)` và `GetBillPropertyAmount(...)`.",
          "Ghi queue/accounting entry qua `AA.Accounting.AccountingManager(...)`.",
          "Có thể thêm secondary activity qua `AA.Framework.SecondaryActivityManager(...)`."
        ]
      },
      {
        name: "REPAY ACCOUNT",
        routine: "AA.ACCOUNT.REPAY.b",
        summary: "Thu nợ principal thật sự của lending account theo repayment reference của activity hiện tại.",
        steps: [
          "Bước 1: kiểm tra charge-off; nếu contract charged off thì routine chạy các subtype `CUST`, `BANK`, `CO`, còn không thì chạy subtype mặc định.",
          "Bước 2: dựng `REPAYMENT.REFERENCE = ARR.ACTIVITY.ID : EFFECTIVE.DATE`, gọi `AA.PaymentSchedule.GetBill(..., REPAYMENT.REFERENCE:@FM:SUB.TYPE, ...)` để lấy đúng bill đã bị repay bởi activity này.",
          "Bước 3: với từng bill, routine đọc `BILL.DETAILS`, dùng `BdBillStatus`, `BdSettleStatus`, `BdAgingStatus`, `BdBillType` để suy ra `REPAY.STATUS`; nếu bill đang aging thì còn gọi `AA.Overdue.OverdueBalanceStatus(...)`.",
          "Bước 4: gọi `AA.PaymentSchedule.GetBillPropertyAmount(\"REPAY\", ...)` để lấy amount của property, rồi dùng `AA.ProductFramework.PropertyGetBalanceName(...)` để xác định balance thật cần knock-off.",
          "Bước 5: routine đọc thêm `AA.ACTIVITY.BALANCES` bằng `AA.Framework.ProcessActivityBalances(...)` để xử lý current hoặc uncleared balance đã settle trong cùng activity.",
          "Bước 6: dựng `EVENT.REC` với amount tuyệt đối, sign credit/debit theo dấu tiền, balance type, contra target suspense hoặc chargeoff target `CF`, rồi gọi `AA.Accounting.AccountingManager(...)`."
        ],
        flow: [
          "Đọc `AA.BILL.DETAILS` theo repayment reference.",
          "Đọc `AA.ACTIVITY.BALANCES` để xử lý phần current hoặc uncleared đã settle.",
          "Ghi accounting queue/entry qua `AA.Accounting.AccountingManager(...)`."
        ]
      }
    ]
  },
  "balance-availability": {
    name: "BALANCE.AVAILABILITY",
    slug: "balance-availability",
    fields: [
      {
        name: "AA.BA.NOTICE.AMOUNT",
        slot: 3,
        details: [
          "Số tiền ngưỡng phải xét rule notice trên từng dòng cấu hình.",
          "Trong `AA.BALANCE.AVAILABILITY.VALIDATE.b`, field này luôn được validate cùng `NOTICE.PERIOD` và `NOTICE.AVAILABILITY`."
        ]
      },
      {
        name: "AA.BA.NOTICE.PERIOD",
        slot: 4,
        details: [
          "Kỳ hạn notice đi kèm với `NOTICE.AMOUNT`.",
          "Routine validate gọi `PERIOD.VAL` cho từng giá trị của field này trước khi chấp nhận rule notice."
        ]
      },
      {
        name: "AA.BA.NOTICE.AVAILABILITY",
        slot: 5,
        details: [
          "Cách áp dụng availability khi rule notice được kích hoạt.",
          "Field này được validate riêng bằng `AVAILABILITY.VAL`, nên nó là tham số quyết định kiểu khả dụng sau notice chứ không chỉ là mô tả."
        ]
      },
      {
        name: "AA.BA.CREDIT.CHECK",
        slot: 6,
        details: [
          "Kiểu kiểm tra khả dụng khi có giao dịch ghi nợ, ví dụ `WORKING`, `AVAILABLE`, `COMPONENT`.",
          "Nếu bật `OVERDRAFT.PROCESSING = YES`, validate bắt buộc field này phải là `COMPONENT`; nếu field bắt đầu bằng `AVAIL` thì còn bắt buộc khai báo `AVAIL.BAL.UPD`."
        ]
      },
      {
        name: "AA.BA.AVAIL.BAL.UPD",
        slot: 7,
        details: [
          "Chỉ ra khi nào available balance được cập nhật: cả hai chiều, chỉ debit, chỉ credit hoặc không update.",
          "Field này trở thành bắt buộc khi `CREDIT.CHECK` dùng nhóm `AVAILABLE`."
        ]
      },
      {
        name: "AA.BA.TOLERANCE.AMOUNT",
        slot: 8,
        details: [
          "Ngưỡng tolerance cho kiểm tra balance availability.",
          "Validate chốt rõ field này phải đi cùng `TOLERANCE.CCY`; nhập một field mà thiếu field còn lại sẽ bị lỗi."
        ]
      },
      {
        name: "AA.BA.LIMIT.CHECK",
        slot: 13,
        details: [
          "Cờ kiểm tra limit ở nhánh NSF hoặc overdraft processing.",
          "Field này nằm trong cụm cấu hình theo activity và chỉ có ý nghĩa khi setup NSF được bật đúng tổ hợp."
        ]
      },
      {
        name: "AA.BA.OVERDRAWN.ACTION",
        slot: 14,
        details: [
          "Activity sẽ được gọi khi account rơi vào trạng thái overdrawn.",
          "Nếu chưa bật `OVERDRAFT.PROCESSING`, validate sẽ cấm nhập field này."
        ]
      },
      {
        name: "AA.BA.OD.CHARGE.ACTION",
        slot: 15,
        details: [
          "Activity dùng để tính/ghi charge do overdraft hoặc NSF.",
          "Field này là một phần của bộ xử lý NSF theo activity, không được phép nhập nếu overdraft processing chưa bật."
        ]
      },
      {
        name: "AA.BA.OVERDRAFT.PROCESSING",
        slot: 17,
        details: [
          "Công tắc bật toàn bộ xử lý overdraft/NSF cho property này.",
          "Khi field này rỗng, hầu hết field NSF phía sau bị cấm nhập; khi bật, một số field như `CREDIT.CHECK` lại trở thành bắt buộc."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE BALANCE.AVAILABILITY",
        routine: "AA.BALANCE.AVAILABILITY.UPDATE.b",
        summary: "Đánh dấu thay đổi condition của property `BALANCE.AVAILABILITY`; logic ghi condition thật được đẩy sang framework.",
        steps: [
          "Bước 1: routine đọc trạng thái activity, action, effective date, arrangement id và property hiện tại từ `AF.Framework`/`AA.Framework`.",
          "Bước 2: rẽ nhánh theo status `UNAUTH`, `DELETE`, `AUTH`, `REVERSE` để xác định mode xử lý.",
          "Bước 3: ở các nhánh `UPDATE`, `DELETE`, `REVERSE`, routine đều gọi `AA.Framework.UpdateChangeCondition()`.",
          "Bước 4: nếu có lỗi, routine ghi lỗi vào `EB.SystemTables.setEtext(...)` và `EB.ErrorProcessing.StoreEndError()`.",
          "Bước 5: cuối routine ghi log debug bằng `AA.Framework.LogManager(...)`."
        ],
        flow: [
          "Không thấy `WRITE/FWRITE` trực tiếp vào bảng nghiệp vụ trong file này.",
          "Điểm ghi thực tế nằm sau lời gọi `AA.Framework.UpdateChangeCondition()`."
        ]
      }
    ]
  },
  "balance-maintenance": {
    name: "BALANCE.MAINTENANCE",
    slug: "balance-maintenance",
    fields: [
      {
        name: "AA.BM.RESTRICT.TYPE",
        slot: 3,
        details: [
          "Loại balance bị khóa hoặc bị giới hạn trong đợt balance maintenance.",
          "Field này check sang `AC.BALANCE.TYPE`, nên nó luôn trỏ tới một balance type thật chứ không phải mô tả tự do."
        ]
      },
      {
        name: "AA.BM.RESTRICT.PROP",
        slot: 4,
        details: [
          "Property bị áp restriction hoặc bị đưa vào phạm vi điều chỉnh balance.",
          "Field này check sang `AA.PROPERTY`, nên nó xác định trực tiếp property nào sẽ bị đụng trong `DATA.CAPTURE`."
        ]
      },
      {
        name: "AA.BM.NET.ADJUST.AMT",
        slot: 6,
        details: [
          "Tổng số tiền điều chỉnh ròng sau khi gộp các dòng balance adjustment đủ điều kiện reporting.",
          "Trong `AA.BALANCE.MAINTENANCE.DATA.CAPTURE.b`, routine `CALCULATE.NET.ADJUSTMENT` ghi lại field này vào `R.NEW`."
        ]
      },
      {
        name: "AA.BM.ADJUST.PROP",
        slot: 8,
        details: [
          "Property được điều chỉnh balance trên từng dòng đa giá trị.",
          "`DATA.CAPTURE` duyệt field này trước để biết phải update `AA.ACTIVITY.BALANCES`, interest accrual hay bill của property nào."
        ]
      },
      {
        name: "AA.BM.ADJ.BAL.TYPE",
        slot: 9,
        details: [
          "Balance type cụ thể trong property sẽ bị điều chỉnh.",
          "Routine `PROCESS.BALANCE.ADJUSTMENT.AMOUNTS` và `CHECK.INTEREST.BALANCE` đọc field này để xác định balance status thực tế như `ACC`, `RES`, `BANK`, `CO`."
        ]
      },
      {
        name: "AA.BM.ORIG.BAL.AMT",
        slot: 10,
        details: [
          "Số dư gốc trước khi adjust hoặc write off.",
          "Nếu không có `WOF.AMOUNT`, nhiều nhánh trong `DATA.CAPTURE` dùng trực tiếp field này làm gốc để tính delta."
        ]
      },
      {
        name: "AA.BM.NEW.BAL.AMT",
        slot: 11,
        details: [
          "Số dư mục tiêu sau điều chỉnh.",
          "Nếu field này có giá trị, routine tính `ADJ.BAL.AMT = (ORIG - NEW) * -1` thay vì lấy amount nhập tay."
        ]
      },
      {
        name: "AA.BM.ADJ.BAL.AMT",
        slot: 14,
        details: [
          "Số tiền chênh lệch cần ghi nhận để chuyển từ số dư cũ sang số dư mới.",
          "Nếu `NEW.BAL.AMT` rỗng nhưng field này có giá trị, `DATA.CAPTURE` dùng luôn amount này khi update `AA.ACTIVITY.BALANCES`."
        ]
      },
      {
        name: "AA.BM.BILL.REF",
        slot: 17,
        details: [
          "Mã bill sẽ bị adjust hoặc write off trong nhánh bill maintenance.",
          "Routine `PROCESS.BILL.UPDATES` duyệt field này để đọc `AA.BILL.DETAILS` và cập nhật amount/status bill tương ứng."
        ]
      },
      {
        name: "AA.BM.NEW.BILL.AMT",
        slot: 20,
        details: [
          "Số tiền bill mục tiêu sau khi adjust.",
          "Field này được ghi ngược lại từ `BILL.DETAILS` sau khi update bill xong, để record maintenance giữ lại kết quả cuối."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE BALANCE.MAINTENANCE",
        routine: "AA.BALANCE.MAINTENANCE.UPDATE.b",
        summary: "Wrapper activity mỏng; không chứa logic nghiệp vụ chính của maintenance.",
        steps: [
          "Bước 1: lấy ngữ cảnh activity và record `R.NEW`.",
          "Bước 2: rẽ nhánh theo status `UNAUTH`, `DELETE`, `AUTH`, `REVERSE`.",
          "Bước 3: không có xử lý nghiệp vụ sâu trong thân file; routine chủ yếu giữ khung activity và error handling.",
          "Bước 4: nếu có lỗi thì đẩy vào `EB.SystemTables.setEtext(...)` và ghi log debug."
        ],
        flow: [
          "Logic thật nằm ở các action `DATA.CAPTURE` và `CAPTURE.BILL`, không nằm trong file `UPDATE`."
        ]
      },
      {
        name: "DATA.CAPTURE BALANCE.MAINTENANCE",
        routine: "AA.BALANCE.MAINTENANCE.DATA.CAPTURE.b",
        summary: "Action lõi của balance maintenance: cập nhật activity balances, interest accruals, bill details và amount ròng điều chỉnh.",
        steps: [
          "Bước 1: ở nhánh input, routine xác định loại activity `capture/adjust/writeoff balance` hay `adjust/writeoff bill`, gán `UPD.TYPE = VAL` và `UPDATE.MODE = BAL.ADJUST`.",
          "Bước 2: `TRUNCATE.UNADJUSTED.BALANCES` xóa các dòng adjust rỗng khỏi `R.NEW`, bao gồm cả `BmAdjBalType`, `BmOrigBalAmt`, `BmNewBalAmt`, `BmAdjBalAmt`, `BmWofAmount`, `BmTotPosAccAmt`, `BmTotNegAccAmt`.",
          "Bước 3: `UPDATE.ACCOUNT.BALANCES` dựng danh sách property, balance type và amount adjustment rồi gọi `AA.Framework.ProcessActivityBalances(...)`, sau đó ghi lại `R.AA.ACTIVITY.BALANCES` bằng `AA.Framework.UpdateActivityBalances(...)`.",
          "Bước 4: `CALCULATE.NET.ADJUSTMENT` đọc `AC.BALANCE.TYPE.BtReportingType`, chỉ cộng các balance loại `NON-CONTINGENT`, rồi ghi `BmNetAdjustAmt` vào `R.NEW`.",
          "Bước 5: nếu property adjust là `INTEREST`, routine đọc `AA.INTEREST.ACCRUALS` bằng `AA.Interest.GetInterestAccruals(\"VAL\", ...)`, tính lại `TOTAL.INT.AMT`, `TOTAL.INT.SUSP.AMT`, split positive/negative rồi gọi `AA.Interest.UpdateInterestAccruals(...)`.",
          "Bước 6: ở nhánh bill, routine đọc `BILL.DETAILS`, update property amount, update delinquency amount, gọi `AA.PaymentSchedule.UpdateBillStatus(...)`, rồi ghi bill bằng `AA.PaymentSchedule.UpdateBillDetails(...)`."
        ],
        flow: [
          "Đọc/ghi `AA.ACTIVITY.BALANCES` qua `AA.Framework.ProcessActivityBalances(...)` và `UpdateActivityBalances(...)`.",
          "Đọc/ghi `AA.INTEREST.ACCRUALS` qua `AA.Interest.GetInterestAccruals(...)` và `UpdateInterestAccruals(...)`.",
          "Đọc/ghi `AA.BILL.DETAILS` qua `AA.PaymentSchedule.GetBillDetails(...)`, `UpdateBillStatus(...)`, `UpdateBillDetails(...)`.",
          "Có thể gọi `AA.PaymentSchedule.ProcessAccountDetails(...)` ở nhánh write off/cooling date."
        ]
      },
      {
        name: "CAPTURE.BILL BALANCE.MAINTENANCE",
        routine: "AA.BALANCE.MAINTENANCE.CAPTURE.BILL.b",
        summary: "Action bill-side của maintenance, dùng khi điều chỉnh bill, tax, current interest và trạng thái settle/aging.",
        steps: [
          "Bước 1: routine lấy bill cần tác động và đọc `BILL.DETAILS` của bill đó.",
          "Bước 2: update amount bill và amount property trên bill theo dữ liệu maintenance hiện tại.",
          "Bước 3: nếu bill là current interest hoặc có tax/suspend amount liên quan, routine cập nhật thêm property amount tương ứng trên bill.",
          "Bước 4: routine cập nhật trạng thái settle/aging của bill rồi ghi lại `AA.BILL.DETAILS`.",
          "Bước 5: khi liên quan interest hiện hành, routine còn phải đồng bộ lại interest accrual tương ứng của bill."
        ],
        flow: [
          "Tác động chính vào `AA.BILL.DETAILS` và các API bill manager của `AA.PaymentSchedule`."
        ]
      }
    ]
  },
  charge: {
    name: "CHARGE",
    slug: "charge",
    fields: [
      {
        name: "AA.CHG.CURRENCY",
        slot: 3,
        details: [
          "Tiền tệ của charge property.",
          "Các action make due, repay, pay, capitalise đều lấy amount của charge theo đúng currency này trước khi build accounting."
        ]
      },
      {
        name: "AA.CHG.CHARGE.TYPE",
        slot: 4,
        details: [
          "Loại charge là `FIXED` hay `CALCULATED`.",
          "Validate dùng field này để chọn giữa amount cố định và bộ tính charge theo tier/routine."
        ]
      },
      {
        name: "AA.CHG.FIXED.AMOUNT",
        slot: 5,
        details: [
          "Số tiền charge cố định nếu `CHARGE.TYPE = FIXED`.",
          "Khi action tài chính đọc property amount trên bill, amount gốc của charge có thể đã được build từ field này."
        ]
      },
      {
        name: "AA.CHG.CALC.THRESHOLD",
        slot: 7,
        details: [
          "Ngưỡng đầu vào để bắt đầu tính charge ở mode calculated.",
          "Field này đi cùng `FREE.AMOUNT` để xác định phần amount nào được miễn hoặc mới bắt đầu bị tính charge."
        ]
      },
      {
        name: "AA.CHG.FREE.AMOUNT",
        slot: 8,
        details: [
          "Phần amount nguồn được miễn trước khi áp charge.",
          "Trong cấu hình calculated charge, field này làm giảm basis trước khi charge rate hoặc charge amount được áp."
        ]
      },
      {
        name: "AA.CHG.CALC.TIER.TYPE",
        slot: 12,
        details: [
          "Kiểu áp tier của charge, ví dụ `BAND` hoặc `LEVEL`.",
          "Field này quyết định bộ `TIER.AMOUNT`, `TIER.COUNT`, `TIER.TERM`, `TIER.MIN.CHARGE`, `TIER.MAX.CHARGE` được hiểu theo cách nào."
        ]
      },
      {
        name: "AA.CHG.CALC.TYPE",
        slot: 13,
        details: [
          "Kiểu công thức charge như `FLAT`, `PERCENTAGE`, `UNIT`.",
          "Validate dùng field này để kiểm tra bộ rate/amount theo tier có hợp lệ không."
        ]
      },
      {
        name: "AA.CHG.CHARGE.ROUTINE",
        slot: 11,
        details: [
          "Routine hook tính charge riêng của property.",
          "Nếu setup charge accounting kiểu accrual mà field này rỗng, validate có thể chặn calculated charge."
        ]
      },
      {
        name: "AA.CHG.REFER.LIMIT",
        slot: 33,
        details: [
          "Cờ cho biết charge này tham chiếu property `LIMIT` của arrangement.",
          "Validate chỉ cho bật field này trên product line `ACCOUNTS` và khi arrangement có setup limit phù hợp."
        ]
      },
      {
        name: "AA.CHG.MIN.CHG.AMOUNT",
        slot: 34,
        details: [
          "Ngưỡng charge tối thiểu trước khi make due hoặc capitalise.",
          "Field này đi cùng `MIN.CHG.WAIVE` để quyết định khoản charge nhỏ sẽ bị waive hay vẫn ghi nhận."
        ]
      },
      {
        name: "AA.CHG.ACCRUAL.RULE",
        slot: 36,
        details: [
          "Rule accrual/amort dùng khi charge được ghi nhận dần theo kỳ.",
          "Các action `ACCRUE`, `MAKE.DUE`, `CAPITALISE` đều đọc field này để quyết định có handoff sang framework accrual hay không."
        ]
      },
      {
        name: "AA.CHG.INTERNAL.BOOKING",
        slot: 41,
        details: [
          "Cờ cho biết charge được hạch toán theo tài khoản nội bộ thay vì contra chuẩn.",
          "Trong logic make due hoặc capitalise, field này làm thay đổi `contraTarget` sang `INT.CM` hoặc cấu hình internal booking tương ứng."
        ]
      }
    ],
    actions: [
      {
        name: "MAKE.DUE CHARGE",
        routine: "AA.CHARGE.MAKE.DUE.b",
        summary: "Action này lấy các bill `DUE/PAY` của charge trong ngày hiệu lực, tính amount due, waive, suspend, kiểm tra accrual hoặc amort, rồi dựng accounting make-due và cập nhật bill nếu charge đã bị adjust về 0.",
        steps: [
          "Bước 1: action lấy `ARRANGEMENT.ID`, `AAA.ID`, `EFFECTIVE.DATE`, `MATURITY.DATE`, `PROPERTY`, `R.ACTIVITY.STATUS`, `R.FULL.ACTIVITY.STATUS`. Nếu arrangement full chargeoff thì tách xử lý thành ba lớp amount `BANK`, `CUST`, `CO`.",
          "Bước 2: với từng lớp xử lý, action đọc property `CHARGE` để lấy `INTERNAL.BOOKING`, `ACCRUAL.RULE`. Sau đó resolve các balance type thật bằng `PropertyGetBalanceName(...)`: `PAY`, `DUE`, `ACC`, `DEF`.",
          "Bước 3: action chọn bill từ `AA.BILL.DETAILS` bằng `AA.PaymentSchedule.GetBill(...)`. Nó lấy bill non-deferred theo `EFFECTIVE.DATE`, lấy thêm bill deferred theo `BdDeferDate`, rồi đọc từng bill bằng `GetBillDetails(...)`. Bill chỉ được giữ lại khi `BdDueReference = AAA.ID` hoặc đúng defer reference của activity hiện tại.",
          "Bước 4: amount chính được lấy như sau. Nếu subtype thường: gọi `GetBillPropertyAmount('DUE', SUB.TYPE, '', PROPERTY, EFFECTIVE.DATE, BILL.DETAILS, PROPERTY.AMOUNT, '', RET.ERROR)`. Nếu subtype `CO`: không tin bill amount mà locate trong `AA.CHARGE.DETAILS` theo `ChgDetPaymentDate = BdPaymentDate` và `ChgDetBillId = BILL.REFERENCE`, rồi lấy `ChgDetAmount` và `ChgDetWaiveAmount`.",
          "Bước 5: action tiếp tục lấy waive amount bằng `GetBillPropertyAmount('WAIVE', ...)` và suspend amount bằng `GetBillPropertyAmount('SUSPEND', ...)`. Nếu charge override routine có mặt và `PROPERTY.AMOUNT = 0` trong khi property vẫn tồn tại trong `BdPayProperty`, nó bật cờ `CHARGE.ADJUST.TO.ZERO`.",
          "Bước 6: action kiểm tra charge này có đang `ACCRUE` hay `AMORT` không. Nếu có, nó không tự sửa `EB.ACCRUAL` mà handoff qua `AccrualDetailsHandoff(...)`. Song song đó nó dựng event accounting theo nhánh `DUE`, `PAY`, `WAIVE`, `SP`, `DEF`, `ACCRUE`, `AMORT`. Nếu charge đã bị adjust về 0 thì update `AA.BILL.DETAILS`: `BILL.STATUS = SETTLED`, `SETTLE.STATUS = REPAID`, rồi ghi bill lại."
        ],
        flow: [
          "Đọc `AA.BILL.DETAILS`: `BdDueReference`, `BdDeferDate`, `BdPaymentMethod`, `BdPaymentDate`, `BdPayProperty`.",
          "Đọc `AA.CHARGE.DETAILS`: `ChgDetPaymentDate`, `ChgDetBillId`, `ChgDetAmount`, `ChgDetWaiveAmount` cho subtype `CO`.",
          "Update `AA.BILL.DETAILS` qua `UpdateBillStatus(...)` và `UpdateBillDetails(...)` khi charge đã bị adjust về 0.",
          "Accounting được build theo amount thực sau waive/suspend rồi post qua `AccountingManager(...)`."
        ]
      },
      {
        name: "PROCESS.CHARGE.MAKE.DUE",
        routine: "AA.PROCESS.CHARGE.MAKE.DUE.b",
        summary: "Routine lõi này thực sự xử lý charge make-due: đọc property `CHARGE`, chọn bill cần xử lý, lấy amount due/waive/suspend, dựng event accounting, handoff accrual hoặc amortisation và có thể cập nhật bill sang `SETTLED/REPAID`.",
        steps: [
          "Bước 1: `INITIALISE` reset các biến `PROPERTY.AMOUNT`, `BILL.REFERENCE`, `ACCRUE.AMORT`, `EVENT.DATE`, `DEBIT.BALANCE.TYPE`, lấy `AAA.ID`, `ACTIVITY.ID`, `MASTER.ACT.CLASS`, cờ payoff/closure và participant details. `GET.INT.BOOKING` đọc property `CHARGE` bằng `AA.ProductFramework.GetPropertyRecord(...)` để lấy `INTERNAL.BOOKING` và `ACCRUAL.RULE`.",
          "Bước 2: `CHECK.CHARGEOFF.STATUS` gọi `AA.ChargeOff.GetChargeoffDetails(...)`; nếu full chargeoff thì loop qua `SUB.TYPE = BANK`, `CUST`, `CO`, nếu không thì xử lý một vòng mặc định.",
          "Bước 3: `GET.BALANCE.TYPES` resolve các balance type thực sự bằng `AA.ProductFramework.PropertyGetBalanceName(...)`: balance credit `PAY`, debit `DUE`, amort `ACC`, defer `DEF`. Nếu `SUB.TYPE = CO`, `GET.CHARGE.DETAILS` gọi `AA.ActivityCharges.ProcessChargeDetails(..., 'INIT', ...)` rồi đọc `AA.Framework.getChargeDetails()` để lấy `AA.CHARGE.DETAILS`.",
          "Bước 4: `GET.BILL` lấy bill non-deferred và deferred bằng `AA.PaymentSchedule.GetBill(...)` cho `PAYMENT.METHOD = DUE/PAY`; nếu closure/payoff thì nó lấy bill từ `PREVIOUS.PAYMENT.DATE`. Với từng bill, `GET.BILL.DETAILS` đọc `AA.BILL.DETAILS`, bỏ bill nếu `BdDueReference` không khớp `AAA.ID`; riêng bill deferred còn đọc `BdDeferDate` để bật `DEFER.RELATED.PROCESSING`.",
          "Bước 5: `GET.DUE.AMOUNTS` lấy `PROPERTY.AMOUNT` là amount due thực của charge. Với subtype thường, amount đến từ `GetBillPropertyAmount('DUE', ...)`. Với subtype `CO`, amount đến từ `AA.CHARGE.DETAILS`. Routine còn đọc `WAIVE.PROPERTY.AMOUNT` và `SUS.PROPERTY.AMOUNT`. Công thức amount dùng để make due là: `PROPERTY.AMOUNT = DUE.PROPERTY.AMOUNT + WAIVE.PROPERTY.AMOUNT` ở nhánh itemized waive; còn ở nhánh thường thì waive có thể kéo amount về `0` hoặc để lại phần due còn phải hạch toán.",
          "Bước 6: `BUILD.ACCOUNTING.UPDATES` tính `EVENT.DATE = BdFinancialDate` hoặc `BdDeferDate`, chọn `PAY.METHOD` là `DUE` hoặc `PAY`, chọn `BALANCE.TYPE`, `CONTRA.TARGET`, `SIGN` theo từng case. Ví dụ: waive itemized dùng `AMOUNT = WAIVE.PROPERTY.AMOUNT`; accrue/amort dùng `AMOUNT = PROPERTY.AMOUNT`; suspend dùng `AMOUNT = SUS.PROPERTY.AMOUNT`. Sau đó build event và đẩy sang `MULTI.EVENT.REC`. Nếu cần đổi lịch accrual/amort, routine handoff qua `AA.Framework.AccrualDetailsHandoff(...)`. Nếu charge đã bị adjust về 0, nó update `AA.BILL.DETAILS` với `BILL.STATUS = SETTLED`, `SETTLE.STATUS = REPAID`."
        ],
        flow: [
          "Đọc `AA.BILL.DETAILS` qua `AA.PaymentSchedule.GetBillDetails(...)` và có thể ghi lại bằng `UpdateBillStatus(...)` + `UpdateBillDetails(...)`.",
          "Đọc `AA.CHARGE.DETAILS` qua `AA.ActivityCharges.ProcessChargeDetails(..., 'INIT', ...)` khi cần subtype `CO`.",
          "Tính amount bill bằng `AA.PaymentSchedule.GetBillPropertyAmount(...)` cho các process type `DUE`, `WAIVE`, `SUSPEND`.",
          "Dựng event bằng `AA.Accounting.BuildEventRec(...)`, còn post thực tế được đẩy sang `AA.Accounting.AccountingManager(...)`.",
          "Điều chỉnh schedule accrual/amort bằng `AA.Framework.AccrualDetailsHandoff(...)` chứ không tự write `EB.ACCRUAL` trực tiếp trong routine này."
        ]
      },
      {
        name: "REPAY CHARGE",
        routine: "AA.CHARGE.REPAY.b",
        summary: "Action repay charge chọn đúng các bill đã bị repay bởi activity hiện tại, lấy amount charge theo từng bill và từng status balance, dựng event repay/suspense/unamort rồi mới gửi sang accounting manager.",
        steps: [
          "Bước 1: wrapper `AA.CHARGE.REPAY.b` lấy `ARRANGEMENT.ID`, `ACTIVITY.DATE`, `ARR.CCY`, `ARR.ACTIVITY.ID`, `REPAY.PROPERTY`, `REVERSAL.MODE`; ở `UNAUTH` nó gọi thẳng `AA.PaymentSchedule.ProcessRepayBills(...)`, còn `DELETE/AUTH` chỉ gọi `AA.Accounting.AccountingManager(...)` để reverse hoặc authorise event đã build sẵn.",
          "Bước 2: trong `AA.PROCESS.REPAY.BILLS.b`, routine kiểm tra action phải là `REPAY`, kiểm tra full chargeoff bằng `AA.ChargeOff.GetChargeoffDetails(...)`, rồi loop các subtype `BANK`, `CUST`, `CO` nếu cần.",
          "Bước 3: `GET.REPAID.BILLS` lấy bill theo `REPAYMENT.REFERENCE = ARR.ACTIVITY.ID : ACTIVITY.DATE`; nếu không có thì thử lại với `ARR.ACTIVITY.ID : ADVANCE : ACTIVITY.DATE`. `GET.BILL.DETAILS` đọc `AA.BILL.DETAILS`, lấy payment type, rồi nếu payment type có alternate method `CAP.AND.INV` thì set `REPAY.STATUS = INV`; còn không thì gọi `AA.PaymentSchedule.GetBillRepayStatus(...)` để tính status balance thật phải knock-off.",
          "Bước 4: `GET.PROPERTY.AMOUNT` đọc amount từ bill bằng hai lần `GetBillPropertyAmount(...)`: lần 1 với `PROCESS.TYPE = REPAY` để lấy `PROPERTY.REPAY.AMOUNT`, lần 2 với `PROCESS.TYPE = REPAY.SUSP` để lấy `PROPERTY.SUSP.AMOUNT`. Nếu full chargeoff thì suspense amount bị xóa. Nếu bill và arrangement đều ở local currency thì `PROPERTY.REPAY.AMOUNT.LCY` bị làm rỗng. Khi advance repayment, `REPAYMENT.DATE` tạm thời bị đổi sang repayment reference để đọc đúng bill amount rồi set lại về effective date.",
          "Bước 5: `GET.PROPERTY.BALANCE` map `REPAY.STATUS` sang balance type thật. `BUILD.ACCOUNTING.UPDATES` tính `ADDITIONAL.INFO = ACC` khi `REPAY.STATUS = CUR`, ngược lại là `OS`; nếu `CAP.AND.INV` thì thêm tiền tố `INV.`. Event amount được tính bằng `PROPERTY.AMOUNT = EVENT.REC<E_amount> + PROPERTY.REPAY.AMOUNT`, sau đó `BuildEventRec(...)` ghi `E_amount = ABS(PROPERTY.REPAY.AMOUNT)`, sign `DEBIT` nếu amount dương, `CREDIT` nếu âm; riêng subtype `CO` ép sign `CREDIT`. Với `BANK` hoặc subtype rỗng thì `E_contraTarget = BAL*<SuspBalanceType>`; với `CO` còn build thêm một event phụ debit suspense và credit `CF` để knock off chargeoff PL.",
          "Bước 6: sau khi loop bill, nếu có `SUSPEND.AMOUNT` thì action gọi `AA.Fees.ChargeRepaySuspense(...)` để tạo event suspense. Sau đó `PROCESS.UNAMORT.CHARGE` đọc `AA.ACTIVITY.BALANCES` qua `AA.Framework.ProcessActivityBalances('GET', ...)` cho balance `ACC` hoặc `DUE` khi `SUB.TYPE = CO`; nếu còn amount thì build thêm event cho unamort charge. Cuối cùng wrapper post toàn bộ qua `AA.Accounting.AccountingManager(...)` và participant side chạy riêng."
        ],
        flow: [
          "Đọc `AA.BILL.DETAILS` để lấy bill status, settle status, payment method và amount repay của property.",
          "Đọc `AA.ACTIVITY.BALANCES` để xử lý phần unamort charge còn tồn tại trong `ACC` hoặc `DUE`.",
          "Dựng event repay và suspense, sau đó post qua `AA.Accounting.AccountingManager(...)`.",
          "File `AA.CHARGE.REPAY.b` chỉ là lớp điều phối; logic bill-level thật nằm ở `AA.PROCESS.REPAY.BILLS.b`."
        ]
      },
      {
        name: "PAY CHARGE",
        routine: "AA.CHARGE.PAY.b",
        summary: "Action này xử lý payout-side cho charge trên deposits/savings: chọn các bill repaid của activity hiện tại, chỉ giữ bill `PAY`, lấy amount charge, xác định balance type và dựng event debit lên suspense hoặc target accounting phù hợp.",
        steps: [
          "Bước 1: `GET.REPAID.BILLS` gọi `AA.PaymentSchedule.GetBill(...)` với `REPAYMENT.REFERENCE = ARR.ACTIVITY.ID : ACTIVITY.DATE` để lấy toàn bộ bill bị hit bởi activity hiện tại.",
          "Bước 2: với từng bill, `GET.BILL.DETAILS` đọc `AA.BILL.DETAILS`, lấy `BdBillStatus` và `BdSettleStatus`; nếu bill đã `REPAID` thì lùi về status trước đó. Routine loại bỏ bill nếu `BdPaymentMethod` không phải `PAY`.",
          "Bước 3: `GET.PROPERTY.AMOUNT` gọi `GetBillPropertyAmount('REPAY', '', '', REPAY.PROPERTY, REPAYMENT.DATE, R.BILL.DETAILS, PROPERTY.REPAY.AMOUNT, PROPERTY.REPAY.AMOUNT.LCY, RET.ERROR)`. Nếu `BdPaymentMethod <> DUE`, action gọi `AA.Tax.GetTaxConsolidatedAmount(...)`; khi `NET.ACCOUNTING` có giá trị thì `PROPERTY.REPAY.AMOUNT` bị thay bằng `CONSOLIDATED.AMOUNT`.",
          "Bước 4: `GET.PROPERTY.BALANCE` map `REPAY.STATUS` thành balance type thật bằng `AA.ProductFramework.PropertyGetBalanceName(...)`. Nếu activity là offset và property `ACCOUNTING` có `AcpOffsetAccounting = ITEMIZE`, `ADD.ADDITIONAL.INFO` gắn `OFFSET` vào event type.",
          "Bước 5: `BUILD.ACCOUNTING.UPDATES` form event type với `GetAccountingEventType(..., ACTIVITY.ACTION, 'PAY', ADDITIONAL.INFO, ...)`, rồi build event với `E_amount += PROPERTY.REPAY.AMOUNT`, `E_sign = DEBIT`, `E_balanceType = PROPERTY.BALANCE`, `E_valueDate = REPAYMENT.DATE`, `E_contraTarget = BAL*<SuspBalanceType>`. Nếu có LCY amount thì set thêm `E_amountLcy`.",
          "Bước 6: `PROCESS.ACCOUNTING.UPDATES` gửi event sang `AA.Accounting.AccountingManager('VAL'/'AUT'/'DEL', REPAY.PROPERTY, ACTIVITY.ACTION, REPAYMENT.DATE, MULTI.EVENT.REC hoặc '', RET.ERROR)`."
        ],
        flow: [
          "Đọc `AA.BILL.DETAILS` và tax consolidation.",
          "Không thấy ghi bill trực tiếp trong file này.",
          "Ghi accounting queue/entry qua `AA.Accounting.AccountingManager(...)`."
        ]
      },
      {
        name: "ACCRUE CHARGE",
        routine: "AA.CHARGE.ACCRUE.b",
        summary: "Action này không tự tính tiền charge. Nó kiểm tra có cần đóng sớm amortisation hay không, nạp các record `EB.ACCRUAL` liên quan đến charge hiện tại và gọi engine `EbCommAccrual` cho đúng record.",
        steps: [
          "Bước 1: `SET.ACTIVITY.DETAILS` lấy `R.ACTIVITY.STATUS`, `R.ACTIVITY.FULL.STATUS`, `ARRANGEMENT.ID`, `PROPERTY`, `THIS.ACTIVITY`, `MASTER.ACT.CLASS`. `INITIALISE` reset `DUES.SETTLED`, `AMORT.TYPE`, `PROCESS.TYPE`.",
          "Bước 2: nếu là `APPLYPAYMENT` do chính activity hiện tại làm master, `CHECK.TO.CLOSE.AMORTISATION` đọc property `CLOSURE` bằng `AA.ProductFramework.GetPropertyRecord(...)`; nếu closure là `AUTOMATIC/BALANCE` thì gọi `AA.Closure.DetermineDueAmount(...)` để xem các due khác đã settle hết chưa.",
          "Bước 3: nếu `DUES.SETTLED<3> = 1`, routine gọi `AA.Framework.AccrualDetailsHandoff(ARRANGEMENT.ID, PROCESS.TYPE, 'CLOSE.AMORT', PROPERTY, PAYMENT.DATE, '', '', '', '', '', PAYMENT.DATE, RETURN.ERROR)` để đóng amortisation tại ngày payment.",
          "Bước 4: `EB.COMM.ACCRUAL.LOAD` mở `F.EB.ACCRUAL`, `F.ACCOUNT.CLOSED`, set `AC.Fees.setAccrueToDate(EFFECTIVE.DATE)`, cờ `EOD` và `EOM`. `PROCESS.AMORT` lấy list `EB.ACCRUAL.ID`, đọc từng record `EB.ACCRUAL`, rồi tách property charge từ field `EbAccChargeNo`: nếu id có 4 thành phần thì lấy phần thứ hai sau dấu `*`, còn không thì lấy trực tiếp `EbAccChargeNo`.",
          "Bước 5: routine chỉ xử lý record nào có property trùng `PROPERTY` hiện tại. Sau đó nó đọc `EbAccAccrToDate` và `EbAccAction`. Nếu `EbAccAction = R` thì chạy reverse accrual; nếu `EbAccAccrToDate < EFFECTIVE.DATE` thì mới accrue tiếp. Engine tính/post thật là `AC.Fees.EbCommAccrual(EB.ACCRUAL.ID)`. `DELETE` làm hai việc: reverse handoff để restore end date, rồi chạy lại accrue vì input applypayment trước đó đã xóa dữ liệu accrual."
        ],
        flow: [
          "Đọc `EB.ACCRUAL`, `ACCOUNT.CLOSED` và common accrual concat của arrangement.",
          "Handoff update schedule accrual qua `AA.Framework.AccrualDetailsHandoff(...)`.",
          "Tính accrual thật bằng `AC.Fees.EbCommAccrual(...)`."
        ]
      },
      {
        name: "CAPITALISE CHARGE",
        routine: "AA.CHARGE.CAPITALISE.b",
        summary: "Action này lấy bill `CAPITALISE` hoặc bill `DUE` có alternate method `CAP.AND.INV`, tính amount capitalise thực của charge sau khi trừ waive, xét defer/suspend/accrue/amort, dựng event accounting và cập nhật payoff details khi cần.",
        steps: [
          "Bước 1: `SET.ACTIVITY.DETAILS` xác định `ARRANGEMENT.ID`, `AAA.ID`, `MASTER.ACT.CLASS`, cờ payoff/closure, `ACTIVITY.ID`, `CHARGE.PROP`, `ALT.CHARGE`; `CHECK.CHARGEOFF.STATUS` xác định có phải full chargeoff để loop `BANK/CUST/CO` hay không.",
          "Bước 2: trong mỗi vòng subtype, `INITIALISE` reset `PROPERTY.AMOUNT`, `ACCRUE.AMORT`, `NET.ACCOUNTING`, sign, participant details. `GET.INT.BOOKING` đọc property `CHARGE` để lấy `INTERNAL.BOOKING` và `ACCRUAL.RULE`. `GET.BALANCE.TYPES` resolve các balance `DEF`, principal `CUR` của `ACCOUNT`, `ACC`, `INV`, `CAP` bằng `AA.ProductFramework.PropertyGetBalanceName(...)`.",
          "Bước 3: `GET.BILL` lấy bill `CAPITALISE` non-deferred, `CAPITALISE` deferred, và thêm bill `DUE` khi payment type có alternate method `CAP.AND.INV`. Với mỗi bill, `GET.BILL.DETAILS` đọc `AA.BILL.DETAILS`, lọc theo `BdDueReference = AAA.ID` hoặc defer date, kiểm tra bill này thật sự chứa `PROPERTY` hiện tại bằng `BdProperty` và `BdPayProperty`. Nếu subtype `CO`, `GET.CHARGE.DETAILS` gọi `AA.ActivityCharges.ProcessChargeDetails(..., 'INIT', ...)` rồi locate theo `ChgDetPaymentDate` + `ChgDetBillId` để lấy `CO.AMOUNT` và `CO.WAIVE.AMOUNT`.",
          "Bước 4: `GET.DUE.AMOUNTS` lấy amount capitalise bằng `GetBillPropertyAmount(...)` với process type `CAPITALISE`, `DEFER.CAPITALISE`, `CAP.REPAY` hoặc `DUE`. Sau đó `PROCESS.WAIVE.AMOUNT` tính `PROPERTY.AMOUNT = PROPERTY.AMOUNT - WAIVE.PROPERTY.AMOUNT`. Nếu sang nhánh itemized waive, event waive được build riêng từ `WAIVE.PROPERTY.AMOUNT`. `GET.SUSPEND.AMOUNTS` lấy `SUS.PROPERTY.AMOUNT`. Với net tax accounting, routine gọi `AA.Tax.GetTaxConsolidatedAmount(...)` để tách `CONSOLIDATED.AMOUNT`.",
          "Bước 5: `CHECK.AMORT.SETTING` xác định `ACCRUE.AMORT`. Khi handoff amortisation, routine tính `PROP.AMT` như sau: nếu `PAY.METHOD = PAY` thì `PROP.AMT = PROPERTY.AMOUNT * -1`, ngược lại `PROP.AMT = ABS(PROPERTY.AMOUNT)`. Ở mode `AMOUNT.CHANGE`, nó còn tính `ADJUST.AMT` bằng `AA.Fees.GetScheduledChargeDetails(...)` rồi trừ `PROP.AMT -= ADJUST.AMT` trước khi handoff. Nếu đang payoff và amount còn lại > 0, routine update `AA.PAYOFF.DETAILS` qua `AA.PaymentSchedule.UpdatePayoffDetails(...)` với các locator `PAYOFF$CURRENT`, `PAYOFF$PAY.CURRENT`, `PAYOFF$INV.DUE`.",
          "Bước 6: `BUILD.ACCOUNTING.UPDATES` chọn event theo nhánh dữ liệu thật. Ví dụ: waive itemized dùng `AMOUNT = WAIVE.PROPERTY.AMOUNT`; accrue/amort dùng `AMOUNT = PROPERTY.AMOUNT`; nhánh suspend accrue build thêm event phụ với `BALANCE.TYPE = AMORT.BALANCE.TYPE:'SP'` và `AMOUNT = SUS.PROPERTY.AMOUNT`; nhánh defer dùng `CONTRA.TARGET = BAL*DEF.BALANCE.TYPE`; nhánh internal booking dùng `INT.CM` hoặc `INT.WAIVE.CM`. Sau khi build các event, `PROCESS.ACCOUNTING.UPDATES` gửi sang `AA.Accounting.AccountingManager(...)`; participant side chạy riêng nếu có participants."
        ],
        flow: [
          "Đọc `AA.BILL.DETAILS` và `AA.CHARGE.DETAILS`.",
          "Cập nhật payoff details qua `AA.PaymentSchedule.UpdatePayoffDetails(...)`.",
          "Handoff accrual schedule qua `AA.Framework.AccrualDetailsHandoff(...)`.",
          "Ghi accounting queue/entry qua `AA.Accounting.AccountingManager(...)`."
        ]
      }
    ]
  },
  interest: {
    name: "INTEREST",
    slug: "interest",
    fields: [
      {
        name: "AA.INT.DAY.BASIS",
        slot: 4,
        details: [
          "Cơ sở đếm ngày dùng để đổi số ngày thành tiền lãi, ví dụ 360 hay 365 ngày.",
          "Nếu field này bỏ trống, `AA.INTEREST.VALIDATE.b` lấy mặc định từ cấu hình tiền tệ `ST.CURRENCY.CONFIG.EbCurInterestDayBasis`."
        ]
      },
      {
        name: "AA.INT.ACCRUAL.RULE",
        slot: 5,
        details: [
          "Mã rule accrual lấy từ `EB.ACCRUAL.PARAM`, quyết định cách engine tính và cycle các kỳ accrual.",
          "Field này là đầu vào trực tiếp của `AA.ACCRUE.INTEREST.b` khi dựng `CALC.PERIOD.EbAcdAccrualParam`."
        ]
      },
      {
        name: "AA.INT.COMPOUND.TYPE",
        slot: 6,
        details: [
          "Cách lãi được nhập gốc hoặc cộng dồn vào basis tính lãi tiếp theo.",
          "Validate chốt rõ: nếu `COMPOUND.YIELD.METHOD = YIELD` thì field này bắt buộc phải là `DAILY`."
        ]
      },
      {
        name: "AA.INT.RATE.TIER.TYPE",
        slot: 8,
        details: [
          "Kiểu áp tier rate: `SINGLE`, `BAND`, `LEVEL`.",
          "Field này quyết định cách engine hiểu `TIER.AMOUNT`, `TIER.PERCENT` và còn bị dùng để chặn compound interest với banded rate."
        ]
      },
      {
        name: "AA.INT.FIXED.RATE",
        slot: 9,
        details: [
          "Rate cố định nhập trực tiếp cho từng tier của property interest.",
          "Trong `AA.INTEREST.UPDATE.b`, field này là một trong các nguồn chính để tính lại `EFFECTIVE.RATE`."
        ]
      },
      {
        name: "AA.INT.FLOATING.INDEX",
        slot: 10,
        details: [
          "Mã index lãi suất thị trường lấy từ `BASIC.RATE.TEXT` cho flow floating rate.",
          "Nếu field này thay đổi, `UPDATE` có thể phải cập nhật lại interest key và scheduled activity `CHANGE` hoặc `APPLY.RATE`."
        ]
      },
      {
        name: "AA.INT.PERIODIC.INDEX",
        slot: 12,
        details: [
          "Mã bảng periodic rate, dùng khi rate chỉ đổi vào các kỳ reset định sẵn.",
          "Field này đi cùng `PERIODIC.PERIOD.TYPE`, `PERIODIC.PERIOD`, `PERIODIC.METHOD`, `PERIODIC.RESET`."
        ]
      },
      {
        name: "AA.INT.MARGIN.RATE",
        slot: 23,
        details: [
          "Giá trị margin số học được cộng, trừ hoặc nhân lên reference rate.",
          "Trong `AA.INTEREST.UPDATE.b`, field này được truyền cùng `MARGIN.OPER` vào routine tính nominal và effective rate."
        ]
      },
      {
        name: "AA.INT.EFFECTIVE.RATE",
        slot: 27,
        details: [
          "Rate cuối cùng sau khi đã áp index, usage percent, margin, cap/floor và negative rate rule.",
          "Các action `ACCRUE` và `MAKE.DUE` không tự tính lại rate mà dùng chính effective rate đã được `UPDATE` và common processing chuẩn hóa."
        ]
      },
      {
        name: "AA.INT.MIN.INT.AMOUNT",
        slot: 34,
        details: [
          "Ngưỡng lãi tối thiểu trước khi make due hoặc waive.",
          "Trong `AA.INTEREST.MAKE.DUE.b`, routine gọi `AA.Interest.AdjustMinInterest(...)` để xử lý phần lãi dưới ngưỡng này."
        ]
      },
      {
        name: "AA.INT.SUPPRESS.ACCRUAL",
        slot: 36,
        details: [
          "Điều khiển việc accrual có được ghi nhận thật hay chỉ tính thông tin, với các giá trị như `YES`, `ALTERNATE`, `INFO.ONLY`.",
          "Action `ACCRUE` đọc thẳng field này để quyết định bỏ qua accrual, chỉ accrue alternate hoặc vẫn tính nhưng đưa principal về 0 để không phát sinh entry."
        ]
      },
      {
        name: "AA.INT.ACCOUNTING.MODE",
        slot: 41,
        details: [
          "Chế độ hạch toán của interest như `ADVANCE` hoặc `UPFRONT.PROFIT`.",
          "Field này làm thay đổi balance được dùng trong `MAKE.DUE`, `DATA.CAPTURE` và cả cách update accrual key của `UPDATE`."
        ]
      }
    ],
    actions: [
      {
        name: "ACCRUE INTEREST",
        routine: "AA.INTEREST.ACCRUE.b / AA.ACCRUE.INTEREST.b",
        summary: "Tính accrual lãi thật, build accounting accrual hoặc suspend, cập nhật `AA.INTEREST.ACCRUALS` và bill-wise accrual nếu property chạy theo bill.",
        steps: [
          "Bước 1: `AA.INTEREST.ACCRUE.b` lấy context activity, `SUPPRESS.ACCRUAL`, `ACCOUNTING.MODE`, subtype cần xử lý, rồi đọc accrual record hiện tại bằng `AA.Interest.GetInterestAccruals(\"VAL\", ...)`.",
          "Bước 2: routine xác định `PERIOD.START.DATE`, `PERIOD.END.DATE` và `ACCRUE.TO.DATE`; các nhánh payoff, make due, apply payment, suspend, adjust balance đều có logic ngày accrue riêng.",
          "Bước 3: khi cần tính thật, routine gọi `AA.Interest.AccrueInterest(...)`, bên trong đi vào `AA.ACCRUE.INTEREST.b` để đọc `AA.ARRANGEMENT`, product, accrual rule, base balance, repayment details và build `CALC.PERIOD`.",
          "Bước 4: `AA.ACCRUE.INTEREST.b` gọi engine `AC.Fees.EbCalculateAccrual(...)`, nhận `THIS.MTH.ACCR`, `PREV.MTH.ACCR`, `PREV.YEAR.ACCR`, `TOTAL.INTEREST`, `ADDITIONAL.INFO`, rồi map vào `COMMITTED.INT`.",
          "Bước 5: quay lại `AA.INTEREST.ACCRUE.b`, routine gọi `AA.Interest.BuildAccrualEvent(...)` để dựng event accounting và `AA.Accounting.AccountingManager(...)` để đẩy queue accrual hoặc suspend.",
          "Bước 6: cuối cùng routine gọi `AA.Interest.UpdateInterestAccruals(...)`; nếu `ACCRUAL.TYPE = BILLS` thì còn update bill accrual qua `AA.Interest.AccrueBills(...)`."
        ],
        flow: [
          "Đọc `AA.INTEREST.ACCRUALS`/`AA.INTEREST.ACCRUALS.WORK`, `AA.ARRANGEMENT`, product, base balance, repayment details và bill.",
          "Ghi `AA.INTEREST.ACCRUALS.WORK` hoặc `AA.INTEREST.ACCRUALS` qua `AA.Interest.UpdateInterestAccruals(...)`.",
          "Cập nhật bill-wise accrual qua `AA.Interest.AccrueBills(...)`.",
          "Ghi accounting entry qua `AA.Accounting.AccountingManager(...)`."
        ]
      },
      {
        name: "UPDATE INTEREST",
        routine: "AA.INTEREST.UPDATE.b / AA.INTEREST.COMMON.PROCESSING.b",
        summary: "Tính lại effective rate, cập nhật interest keys, schedule floating hoặc periodic reset và change condition của property interest.",
        steps: [
          "Bước 1: routine xác định property, currency, product line, có accrual-by-bills hay forward-dated hay không.",
          "Bước 2: dựa trên `ON.ACTIVITY` và `RECALCULATE`, routine chọn `REQUEST.TYPE` rồi gọi `AA.Interest.InterestCommonProcessing(...)` để tính lại `EFFECTIVE.RATE` và ghi vào `R.NEW`.",
          "Bước 3: nếu custom rate bật mà `EFFECTIVE.RATE` vẫn rỗng, routine báo lỗi ngay trên property hiện tại.",
          "Bước 4: routine gọi `AA.Interest.UpdateInterestAccruals(...)` để đồng bộ lại interest keys, payment mode `ADVANCE` hoặc cờ accrual-by-bills mới vào accrual record.",
          "Bước 5: nếu có `FLOATING.INDEX`, routine tính `NEXT.CYCLED.DATE` bằng `AA.Interest.GetNextFloatingDate(...)` rồi update scheduled activity `CHANGE` hoặc `APPLY.RATE`.",
          "Bước 6: nếu có `PERIODIC.INDEX` hoặc `PERIODIC.RESET`, routine tính ngày reset tiếp theo bằng `AA.Interest.GetPeriodicRecalcDate(...)`, update `AA.SCHEDULED.ACTIVITY`, rồi gọi `AA.Framework.UpdateChangeCondition()`."
        ],
        flow: [
          "Ghi `EFFECTIVE.RATE` và các field rate/margin lên `R.NEW`.",
          "Cập nhật `AA.INTEREST.ACCRUALS`/`WORK` qua `AA.Interest.UpdateInterestAccruals(...)`.",
          "Cập nhật `AA.SCHEDULED.ACTIVITY` qua `AA.Framework.SetScheduledActivity(...)`."
        ]
      },
      {
        name: "MAKE.DUE INTEREST",
        routine: "AA.INTEREST.MAKE.DUE.b",
        summary: "Chuyển lãi từ accrued sang due hoặc pay, xử lý residual, minimum interest, suspend và cycle kỳ accrual.",
        steps: [
          "Bước 1: routine đọc accrual detail hiện tại, xác định `ADVANCE.FLAG`, residual process flag, alternate-interest flag và nhánh closure hoặc payoff.",
          "Bước 2: gọi `AA.PaymentSchedule.GetBill(...)` để lấy bill `PAYMENT`, rồi lặp bill chứa property interest hiện tại.",
          "Bước 3: trên từng bill, routine đọc amount `DUE`, `WAIVE`, `SUSPEND` bằng `AA.PaymentSchedule.GetBillPropertyAmount(...)`; nếu là negative interest thì có thể đảo dấu amount due.",
          "Bước 4: dựng cặp balance accounting `DUE`, `ACC`, `PAY`, `DEF`, `REC`, `...SP` tùy bill type, deferred processing và `ACCOUNTING.MODE = ADVANCE` hoặc `UPFRONT.PROFIT`.",
          "Bước 5: nếu property có residual accrual hoặc minimum interest, routine gọi `AA.Interest.GetAdjustedInterestAmount(...)` và `AA.Interest.AdjustMinInterest(...)` để build thêm event điều chỉnh.",
          "Bước 6: gọi `AA.Accounting.AccountingManager(...)` để post queue, rồi `AA.Interest.MaintainInterestPeriods(...)` và `AA.Interest.UpdateInterestAccruals(...)` để cycle kỳ và đồng bộ due amount."
        ],
        flow: [
          "Đọc `AA.BILL.DETAILS` và `AA.INTEREST.ACCRUALS`.",
          "Ghi accounting queue/entry qua `AA.Accounting.AccountingManager(...)`.",
          "Cập nhật `AA.INTEREST.ACCRUALS` qua `AA.Interest.MaintainInterestPeriods(...)` và `UpdateInterestAccruals(...)`."
        ]
      }
    ]
  },
  "payment-rules": {
    name: "PAYMENT.RULES",
    slug: "payment-rules",
    fields: [
      {
        name: "AA.PAYRULE.FINANCIAL.STATUS",
        slot: 3,
        details: [
          "Trạng thái tài chính mà rule này áp dụng, ví dụ `PERFORMING`, `SUSPENDED`, `RESTRUCTURE` hoặc `BOTH`.",
          "Validate dùng field này để chọn đúng rule theo ngữ cảnh tài chính của arrangement."
        ]
      },
      {
        name: "AA.PAYRULE.APPLICATION.TYPE",
        slot: 4,
        details: [
          "Loại rule phân bổ tiền, check sang `AA.PAYMENT.RULE.TYPE`.",
          "Action `ALLOCATE` đọc thẳng field này để xác định rule phân bổ theo current, bill property, bill date, advance payment hay kiểu khác."
        ]
      },
      {
        name: "AA.PAYRULE.APPLICATION.ORDER",
        slot: 5,
        details: [
          "Thứ tự áp rule, ví dụ `OLDEST.FIRST` hoặc `OLDEST.LAST`.",
          "Field này quyết định bill nào được ưu tiên ăn tiền trước khi `AA.PaymentRules.AllocatePaymentAmount(...)` phân bổ."
        ]
      },
      {
        name: "AA.PAYRULE.SEQUENCE",
        slot: 6,
        details: [
          "Thứ tự của property hoặc balance trong cùng một application rule.",
          "Field này phối hợp với `APPLICATION.ORDER` để tạo ra order phân bổ cuối cùng."
        ]
      },
      {
        name: "AA.PAYRULE.PROPERTY",
        slot: 7,
        details: [
          "Property sẽ được đưa vào rule allocate hoặc create due.",
          "Khi action `ALLOCATE` chạy, field này là đầu mối để map amount vào đúng property trên bill."
        ]
      },
      {
        name: "AA.PAYRULE.BALANCE.TYPE",
        slot: 8,
        details: [
          "Balance type cụ thể bên dưới property nếu rule chỉ áp ở mức balance.",
          "Validate dùng field này để chặn các combination sai giữa property, rule type và property application type."
        ]
      },
      {
        name: "AA.PAYRULE.PROP.APPL.TYPE",
        slot: 9,
        details: [
          "Cách áp rule ở mức property, hiện source cho thấy giá trị thực tế là `BALANCES`.",
          "Nếu field này có giá trị, allocate sẽ đi sâu tới balance type chứ không chỉ dừng ở amount tổng của property."
        ]
      },
      {
        name: "AA.PAYRULE.PRE.BILL.ACTIVITY",
        slot: 10,
        details: [
          "Activity phụ sẽ được append khi rule bill-based chưa có bill để xử lý.",
          "Action `PRE.BILL` dựng `AAA.REC` mới từ field này rồi append vào secondary activity list."
        ]
      },
      {
        name: "AA.PAYRULE.REMAINDER.ACTIVITY",
        slot: 11,
        details: [
          "Activity xử lý phần tiền còn dư sau khi phân bổ hết các rule chính.",
          "Trong `ALLOCATE`, nếu còn `REMAINDER.AMOUNT`, routine sẽ tạo secondary activity dùng chính field này."
        ]
      },
      {
        name: "AA.PAYRULE.MAKE.BILL.DUE",
        slot: 12,
        details: [
          "Cờ cho biết sau khi allocate có phải tạo make-due activity cho bill hay không.",
          "Action `CREATE.DUE` chỉ chạy logic chính khi field này là `YES`."
        ]
      },
      {
        name: "AA.PAYRULE.ADVANCE.PAYMENT.METHOD",
        slot: 13,
        details: [
          "Cách xử lý advance payment, ví dụ `PARTIAL` hoặc `FULL`.",
          "Field này được đưa vào `PAYMENT.RULES.DEFINITIONS` trước khi allocate advance settlement."
        ]
      },
      {
        name: "AA.PAYRULE.SETTLE.UNEARNED.INTEREST",
        slot: 15,
        details: [
          "Cờ cho phép advance settlement ăn cả phần lãi chưa earned.",
          "Field này ảnh hưởng trực tiếp tới cách repayment được allocate trong payoff hoặc advance payment."
        ]
      }
    ],
    actions: [
      {
        name: "ALLOCATE PAYMENT.RULES",
        routine: "AA.PAYMENT.RULES.ALLOCATE.b",
        summary: "Phân bổ số tiền repayment vào bill và property theo financial allocation rule đang hiệu lực.",
        steps: [
          "Bước 1: routine đọc rule hiệu lực bằng `AA.PaymentRules.GetFinancialAllocationRule(...)`, đồng thời lấy repayment amount của AAA hiện tại.",
          "Bước 2: nếu là advance payment, routine kiểm tra còn due hoặc aging bill bằng `AA.PaymentSchedule.GetBill(..., \"DUE\":@VM:\"AGING\", ...)`; nếu còn bill chưa settle thì raise override `AA.OUTSTANDING.BILLS.NOT.SETTLED`.",
          "Bước 3: nếu không phải advance, routine gọi `AA.PaymentRules.AllocatePaymentAmount(...)` để sinh ra `BILL.REFERENCE`, `BILL.PROPERTY`, `BILL.PROPERTY.DUE.AMOUNT`, `BILL.PROPERTY.REPAY.AMOUNT`, `REMAINDER.AMOUNT`, `BILL.REPAY.DATES`.",
          "Bước 4: lấy tổng amount đã phân bổ thực tế từ `BILL.PROPERTY.REPAY.AMOUNT` rồi gọi `AA.PayoutRules.UpdateBillPaymentAmounts(...)` để cập nhật payment amount trên bill.",
          "Bước 5: nếu còn `REMAINDER.AMOUNT`, routine dựng secondary activity mới bằng `AA.Framework.SecondaryActivityManager(...)` dựa trên `REMAINDER.ACTIVITY`.",
          "Bước 6: với technical loan, routine còn đọc `AA.RESTRUCTURE.STATUS`, `AA.ACTIVITY.MAPPING`, `AA.ACTIVITY.BALANCES` để tạo secondary activity repay trên original loan."
        ],
        flow: [
          "Đọc financial rule và bill list hiện hành.",
          "Cập nhật `AA.BILL.DETAILS` gián tiếp qua `AA.PayoutRules.UpdateBillPaymentAmounts(...)`.",
          "Có thể tạo secondary activity qua `AA.Framework.SecondaryActivityManager(...)`."
        ]
      },
      {
        name: "CREATE.DUE PAYMENT.RULES",
        routine: "AA.PAYMENT.RULES.CREATE.DUE.b",
        summary: "Tạo secondary make-due activity cho các bill `ISSUED` khi rule yêu cầu biến bill issued thành bill due.",
        steps: [
          "Bước 1: routine chỉ đi tiếp khi `MAKE.BILL.DUE = YES` trên rule hiệu lực.",
          "Bước 2: đọc toàn bộ bill `ISSUED` của arrangement bằng `AA.PaymentSchedule.GetBill(...)`.",
          "Bước 3: với từng bill, routine đọc `BILL.DETAILS`, lấy `PAYMENT.DATE`, `PAYMENT.METHOD`, `BILL.TYPE`, rồi map sang system bill type.",
          "Bước 4: nếu bill là `PR.CHARGE` hoặc `ACT.CHARGE`, routine lấy `PROPERTY.ID` từ bill và chỉ tạo một make-due activity cho mỗi property.",
          "Bước 5: activity make-due mới không được ghi thành record độc lập ngay tại đây, mà được append qua cơ chế secondary activity."
        ],
        flow: [
          "Đọc `AA.BILL.DETAILS` của các bill `ISSUED`.",
          "Ghi secondary activity list qua framework thay vì write trực tiếp file bill."
        ]
      },
      {
        name: "PRE.BILL PAYMENT.RULES",
        routine: "AA.PAYMENT.RULES.PRE.BILL.b",
        summary: "Tạo activity phụ trước bill khi rule phân bổ theo bill nhưng hiện tại chưa có bill để xử lý.",
        steps: [
          "Bước 1: routine đọc rule hiệu lực và kiểm tra `APPLICATION.TYPE` có phải dạng bill-based như `BILL.PROPERTY` hoặc `BILL.DATE` hay không.",
          "Bước 2: gọi `AA.PaymentSchedule.GetBill(...)` để kiểm tra arrangement hiện đã có bill nào chưa.",
          "Bước 3: nếu không có `BILL.REFERENCE` và `PRE.BILL.ACTIVITY.ID` có giá trị, routine dựng `AAA.REC` mới.",
          "Bước 4: set `ArrActArrangement`, `ArrActActivity`, `ArrActEffectiveDate`, `ArrActLinkedActivity` cho `AAA.REC` rồi append vào secondary activity list bằng `AA.Framework.SecondaryActivityManager(\"APPEND.TO.LIST\", AAA.REC)`."
        ],
        flow: [
          "Không ghi bill trực tiếp.",
          "Tạo secondary activity để luồng tiếp theo xử lý phần pre-bill."
        ]
      }
    ]
  },
  "payment-schedule": {
    name: "PAYMENT.SCHEDULE",
    slug: "payment-schedule",
    fields: [
      {
        name: "AA.PS.BASE.DATE",
        slot: 3,
        details: [
          "Ngày gốc để engine dựng lịch thanh toán của property schedule.",
          "Các kỳ bill và scheduled activity về sau đều neo từ mốc này hoặc từ biến thể base-date liên quan."
        ]
      },
      {
        name: "AA.PS.BASE.DAY.KEY",
        slot: 4,
        details: [
          "Khóa phụ xác định ngày cơ sở khi tính lịch theo quy ước ngày.",
          "Field này đi cùng `BASE.DATE`, `DATE.CONVENTION` và điều khiển cách schedule manager bẻ kỳ."
        ]
      },
      {
        name: "AA.PS.AMORTISATION.TERM",
        slot: 8,
        details: [
          "Kỳ hạn dùng để chia amortisation của payment schedule.",
          "Field này là đầu vào cho engine build amount và bill sequence của schedule."
        ]
      },
      {
        name: "AA.PS.RESIDUAL.AMOUNT",
        slot: 9,
        details: [
          "Phần amount để lại cho kỳ residual hoặc balloon cuối cùng.",
          "Ở các nhánh make due hoặc residual processing, field này quyết định còn phải sinh activity cuối kỳ hay không."
        ]
      },
      {
        name: "AA.PS.PAYMENT.TYPE",
        slot: 10,
        details: [
          "Loại payment trên schedule, ví dụ current, expected, charge bill hay bill đặc thù khác.",
          "Các action `MAKE.DUE` và `CAPITALISE` đọc field này gián tiếp qua `BILL.DETAILS` để map sang system bill type và chọn accounting path."
        ]
      },
      {
        name: "AA.PS.PAYMENT.METHOD",
        slot: 11,
        details: [
          "Cách xử lý payment của dòng schedule như `DUE`, `PAY`, `CAPITALISE` hoặc dạng deferred tương ứng.",
          "Field này quyết định bill nào được lấy trong `MAKE.DUE` và `CAPITALISE` và balance nào được dùng để hạch toán."
        ]
      },
      {
        name: "AA.PS.PROPERTY",
        slot: 17,
        details: [
          "Property mà dòng schedule này điều khiển.",
          "Khi bill được đọc lại, chính field này làm khóa để tách amount của từng property trên cùng bill."
        ]
      },
      {
        name: "AA.PS.DUE.FREQ",
        slot: 18,
        details: [
          "Tần suất đến hạn của dòng schedule.",
          "Field này phối hợp với `PAYMENT.FREQ` để xác định thời điểm issue bill và make due."
        ]
      },
      {
        name: "AA.PS.PERCENTAGE",
        slot: 19,
        details: [
          "Tỷ lệ amount mà dòng schedule này chiếm trong tổng payment.",
          "Khi recalculate due amount, field này ảnh hưởng trực tiếp tới amount property được đẩy xuống bill."
        ]
      },
      {
        name: "AA.PS.START.DATE",
        slot: 20,
        details: [
          "Ngày bắt đầu áp dụng dòng schedule.",
          "Các action make due và capitalise dùng ngày này cùng last payment date để xác định period nào phải cycle."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE PAYMENT.SCHEDULE",
        routine: "AA.PAYMENT.SCHEDULE.UPDATE.b",
        summary: "Wrapper update condition của schedule; phần tạo lịch và cycle bill nằm trong schedule manager và các action tài chính.",
        steps: [
          "Bước 1: routine lấy ngữ cảnh activity và xác định mode `UPDATE`, `DELETE` hoặc `AUTHORISE`.",
          "Bước 2: gọi `AA.PaymentSchedule.PaymentScheduleManager(...)` với mode tương ứng.",
          "Bước 3: nếu không lỗi, routine gọi `AA.Framework.UpdateChangeCondition()` để chốt thay đổi condition.",
          "Bước 4: phần build schedule details, bill và `AA.SCHEDULED.ACTIVITY` không nằm trong file này."
        ],
        flow: [
          "Không thấy write trực tiếp bill trong file wrapper này.",
          "Điểm xử lý thực tế được đẩy vào `PaymentScheduleManager`."
        ]
      },
      {
        name: "MAKE.DUE PAYMENT.SCHEDULE",
        routine: "AA.PAYMENT.SCHEDULE.MAKE.DUE.b",
        summary: "Action lõi để lấy bill đến hạn, cập nhật bill details, account details, bill-wise interest accrual và cycle scheduled activity.",
        steps: [
          "Bước 1: routine lấy `LAST.PAYMENT.DATE`, gọi `RECALCULATE.DUE.AMOUNTS` và `PROCESS.ISSUE.BILL` để đảm bảo bill đến hạn đã sẵn sàng.",
          "Bước 2: trong nhánh financial, routine gọi `GET.BILL`, lặp bill, đọc `BILL.DETAILS`, rồi `GET.DUE.AMOUNTS` để lấy amount due của từng property.",
          "Bước 3: routine lấy thêm payment dates, actual dates, financial date rồi `UPDATE.BILL.DETAILS` để cập nhật amount property, amount tax hoặc adjust cần thiết trên bill.",
          "Bước 4: sau đó gọi `UPDATE.BILL.STATUS`, `UPDATE.PAYMENT.DETAILS`, `UPDATE.SETTLEMENT.STATUS` rồi ghi bill bằng `WRITE.BILL.DETAILS`.",
          "Bước 5: nếu bill có interest theo bill, routine gọi `AA.Interest.CreateBillInterestAccruals(...)`; với charge accrual thì gọi `AA.PaymentSchedule.ChargeAccrualHandoff(...)`.",
          "Bước 6: cuối cùng routine update next schedule details và `AA.SCHEDULED.ACTIVITY` nếu không rơi vào closure hoặc interim case."
        ],
        flow: [
          "Đọc/ghi `AA.BILL.DETAILS`.",
          "Cập nhật `AA.ACCOUNT.DETAILS` ở bước payment details.",
          "Tạo bill-wise interest accrual và handoff charge accrual.",
          "Cập nhật `AA.SCHEDULED.ACTIVITY` cho kỳ tiếp theo."
        ]
      },
      {
        name: "CAPITALISE PAYMENT.SCHEDULE",
        routine: "AA.PAYMENT.SCHEDULE.CAPITALISE.b",
        summary: "Xử lý capitalise bill của schedule, gồm projected bill, reverse flow, account details và next scheduled activity.",
        steps: [
          "Bước 1: routine lấy `LAST.PAYMENT.DATE`, kiểm tra projected bill online capitalise rồi `RECALCULATE.DUE.AMOUNTS` và `PROCESS.ISSUE.BILL`.",
          "Bước 2: trong nhánh financial, routine lấy bill `CAPITALISE` và các bill liên quan, đọc `BILL.DETAILS`, rồi tính amount capitalise hoặc due theo từng property.",
          "Bước 3: với projected bill hoặc online capitalise, routine dùng nhánh cache/process riêng để không ghi trùng bill thực tế.",
          "Bước 4: ở delete hoặc reverse, routine đọc lại bill đã capitalise, khôi phục payment details, settlement status và amount cũ trên bill.",
          "Bước 5: routine gọi `AA.PaymentSchedule.ChargeAccrualHandoff(...)` khi có periodic charge cần đi cùng capitalisation.",
          "Bước 6: sau khi xong bill-side processing, routine cập nhật next schedule details và `AA.SCHEDULED.ACTIVITY` cho các kỳ sau."
        ],
        flow: [
          "Đọc/ghi `AA.BILL.DETAILS`.",
          "Cập nhật `AA.ACCOUNT.DETAILS` và settlement status khi reverse hoặc complete capitalise.",
          "Cập nhật projected capitalise data và `AA.SCHEDULED.ACTIVITY`."
        ]
      }
    ]
  },
  "periodic-charges": {
    name: "PERIODIC.CHARGES",
    slug: "periodic-charges",
    fields: [
      {
        name: "AA.PRD.CHG.INC.ALL.DEF.CHGS",
        slot: 3,
        details: [
          "Cờ cho biết action có phải kéo cả deferred charges vào cùng kỳ xử lý hay không.",
          "Field này làm thay đổi phạm vi bill được lấy trong `MAKE.DUE` và `CAPITALISE`."
        ]
      },
      {
        name: "AA.PRD.CHG.DEFERRED.CHARGE",
        slot: 4,
        details: [
          "Xác định periodic charge này đang đi theo nhánh deferred charge.",
          "Khi field này bật, các action sẽ lấy thêm bill `DEFER.MAKEDUE`, `DEFER.CAPITALISE` hoặc amount deferred tương ứng."
        ]
      },
      {
        name: "AA.PRD.CHG.CHARGE.PROPERTY",
        slot: 5,
        details: [
          "Property charge thật được periodic charge này điều khiển.",
          "Các action bill-side đều dùng field này để lấy amount charge đúng property trên `BILL.DETAILS`."
        ]
      },
      {
        name: "AA.PRD.CHG.CHARGE.GROUP",
        slot: 6,
        details: [
          "Nhóm charge để engine periodic charge gom hoặc lọc charge cần xử lý.",
          "Field này đặc biệt quan trọng trong issue bill và make due theo charge group."
        ]
      },
      {
        name: "AA.PRD.CHG.ACTIVITY.ID",
        slot: 10,
        details: [
          "Activity được dùng để raise periodic charge hoặc gắn vào bill được sinh ra.",
          "Field này là cầu nối giữa property periodic charge và AAA/bill mà action tài chính sẽ xử lý."
        ]
      },
      {
        name: "AA.PRD.CHG.FREE.CHARGE.GROUP",
        slot: 11,
        details: [
          "Nhóm charge được miễn trong một số tình huống transaction hoặc usage count.",
          "Field này đi cùng `FREE.TXN.CNT` để quyết định charge nào chưa phải lên bill."
        ]
      },
      {
        name: "AA.PRD.CHG.FREE.TXN.CNT",
        slot: 12,
        details: [
          "Số lượng transaction được miễn charge trước khi periodic charge bắt đầu tính tiền.",
          "Field này là tham số đầu vào cho logic build bill hoặc charge details của periodic charge."
        ]
      },
      {
        name: "AA.PRD.CHG.CURRENCY",
        slot: 16,
        details: [
          "Tiền tệ của periodic charge.",
          "Các action `MAKE.DUE`, `PAY`, `REPAY`, `CAPITALISE` lấy amount charge trên bill theo currency này."
        ]
      },
      {
        name: "AA.PRD.CHG.MAX.CHG.AMOUNT",
        slot: 17,
        details: [
          "Mức charge tối đa cho periodic charge theo chiều debit thông thường.",
          "Field này giới hạn amount cuối cùng được đưa xuống bill hoặc accounting."
        ]
      },
      {
        name: "AA.PRD.CHG.MIN.CHG.AMOUNT",
        slot: 18,
        details: [
          "Mức charge tối thiểu trước khi periodic charge được ghi bill hoặc due.",
          "Field này ảnh hưởng trực tiếp đến việc amount nhỏ bị waive hay vẫn bị make due."
        ]
      }
    ],
    actions: [
      {
        name: "MAKE.DUE PERIODIC.CHARGES",
        routine: "AA.PERIODIC.CHARGES.MAKE.DUE.b",
        summary: "Xử lý bill định kỳ của charge, bao gồm deferred charge, chargeoff subtype, accounting và bill/status processing.",
        steps: [
          "Bước 1: routine xác định subtype chargeoff `BANK`, `CUST`, `CO` khi contract full chargeoff.",
          "Bước 2: lấy bill cần make due, gồm cả bill deferred nếu property setup cho deferred periodic charge.",
          "Bước 3: đọc `BILL.DETAILS`, amount property, amount waive, tax và suspend để dựng accounting path đúng.",
          "Bước 4: build accounting cho periodic charge hiện tại và các nhánh internal booking hoặc chargeoff nếu có.",
          "Bước 5: cập nhật bill details, bill status, settlement status và có thể handoff charge accrual sang framework."
        ],
        flow: [
          "Đọc `AA.BILL.DETAILS` và gọi API `AA.PaymentSchedule` để update bill/status.",
          "Có thể build accounting và handoff charge accrual."
        ]
      },
      {
        name: "CAPITALISE PERIODIC.CHARGES",
        routine: "AA.PERIODIC.CHARGES.CAPITALISE.b",
        summary: "Capitalise periodic charge từ bill `CAPITALISE` hoặc `DEFER.CAPITALISE`, đồng thời xử lý waive, suspend, tax và accrual handoff.",
        steps: [
          "Bước 1: routine lấy bill `CAPITALISE` hoặc `DEFER.CAPITALISE`; trong payoff hoặc closure còn xác định nhánh `PAYOFF.CAPITALISE` riêng.",
          "Bước 2: đọc `BILL.DETAILS`, lấy property amount, waive amount, suspend amount và tax amount của periodic charge.",
          "Bước 3: build event accounting bằng `AA.Accounting.BuildEventRec(...)` theo đúng payment method và contra target.",
          "Bước 4: nếu periodic charge đang đi accrual hoặc amort, routine gọi `AA.Framework.AccrualDetailsHandoff(...)` để đồng bộ schedule accrual.",
          "Bước 5: gửi toàn bộ event vào `AA.Accounting.AccountingManager(...)` và ghi payoff details nếu flow là payoff."
        ],
        flow: [
          "Đọc bill capitalise/defer capitalise từ `AA.BILL.DETAILS`.",
          "Handoff accrual schedule qua `AA.Framework.AccrualDetailsHandoff(...)`.",
          "Ghi accounting qua `AA.Accounting.AccountingManager(...)`."
        ]
      },
      {
        name: "REPAY PERIODIC.CHARGES",
        routine: "AA.PERIODIC.CHARGES.REPAY.b",
        summary: "Thu repayment của periodic charge dựa trên bill đã repay và hạch toán lại phần charge hoặc suspense liên quan.",
        steps: [
          "Bước 1: routine lấy các bill đã repay theo repayment reference hiện tại và chạy riêng theo subtype chargeoff nếu cần.",
          "Bước 2: đọc `BILL.DETAILS`, lấy amount property, amount balance và bill status thực tế của periodic charge.",
          "Bước 3: build accounting cho repayment của charge theo từng bill; nếu có suspend amount thì gọi `AA.Fees.ChargeRepaySuspense(...)`.",
          "Bước 4: gửi queue accounting qua `AA.Accounting.AccountingManager(...)`."
        ],
        flow: [
          "Đọc `AA.BILL.DETAILS`.",
          "Ghi accounting và có thể xử lý suspense charge riêng."
        ]
      },
      {
        name: "PAY PERIODIC.CHARGES",
        routine: "AA.PERIODIC.CHARGES.PAY.b",
        summary: "Payout-side accounting cho periodic charge, đọc bill đã pay và raise event trực tiếp.",
        steps: [
          "Bước 1: routine lấy bill theo repayment reference của activity hiện tại.",
          "Bước 2: đọc `BILL.DETAILS` rồi gọi `AA.PaymentSchedule.GetBillPropertyAmount(...)` để lấy amount của periodic charge.",
          "Bước 3: xác định balance type và event type bằng `AA.Accounting.GetAccountingEventType(..., \"PAY\", ...)`.",
          "Bước 4: dựng `EVENT.REC` rồi gọi `AA.Accounting.AccountingManager(...)`."
        ],
        flow: [
          "Đọc `AA.BILL.DETAILS`.",
          "Ghi accounting queue/entry qua `AA.Accounting.AccountingManager(...)`."
        ]
      },
      {
        name: "ACCRUE PERIODIC.CHARGES",
        routine: "AA.PERIODIC.CHARGES.ACCRUE.b",
        summary: "Wrapper accrual của periodic charge; file này chỉ handoff sang engine charge accrual chung.",
        steps: [
          "Bước 1: routine gọi trực tiếp `AA.Fees.ChargeAccrue()`.",
          "Bước 2: phần đọc `EB.ACCRUAL`, tính accrual và update accrual record được xử lý bên trong engine charge accrual dùng chung."
        ],
        flow: [
          "File wrapper không tự đọc bill hay update record.",
          "Toàn bộ logic accrual được đẩy sang `AA.Fees.ChargeAccrue()`."
        ]
      }
    ]
  },
  settlement: {
    name: "SETTLEMENT",
    slug: "settlement",
    fields: [
      {
        name: "AA.SET.PAYMENT.TYPE",
        slot: 6,
        details: [
          "Khóa nghiệp vụ chính của settlement, check sang `AA.PAYMENT.TYPE`.",
          "Mỗi payment type sẽ kéo theo một bộ payin hoặc payout account, activity, percentage và rule debit-credit riêng."
        ]
      },
      {
        name: "AA.SET.PAYIN.SETTLE.ACTIVITY",
        slot: 7,
        details: [
          "Activity settle sẽ được dùng cho nhánh payin của payment type hiện tại.",
          "Validate có thể tự điền default activity vào field này từ cấu hình settlement type."
        ]
      },
      {
        name: "AA.SET.PAYIN.SETTLEMENT",
        slot: 8,
        details: [
          "Cờ bật hoặc tắt settlement cho nhánh payin.",
          "Nếu field này bật, payin side mới được coi là nguồn tiền chính thức cho due processing."
        ]
      },
      {
        name: "AA.SET.PAYIN.AC.DB.RULE",
        slot: 10,
        details: [
          "Rule debit-credit của settlement account phía payin, check sang `AA.SETTLEMENT.TYPE`.",
          "Trong `DUE.PROCESSING`, field này được đọc vào `SETTLE.OPTION` để quyết định cách split và booking payin."
        ]
      },
      {
        name: "AA.SET.PAYIN.ACCOUNT",
        slot: 12,
        details: [
          "Account nội bộ dùng để nạp tiền vào arrangement ở nhánh payin.",
          "Action `DUE.PROCESSING` đọc thẳng field này từ `SETTLEMENT.ARRAY` để biết account nào sẽ bị debit hoặc credit."
        ]
      },
      {
        name: "AA.SET.PAYIN.PERCENTAGE",
        slot: 15,
        details: [
          "Tỷ lệ amount của từng destination payin.",
          "Field này đi cùng `PAYIN.AMOUNT`; trong create DD hoặc settlement split, chỉ một trong hai hoặc cả cặp sẽ quyết định số tiền đi vào từng account."
        ]
      },
      {
        name: "AA.SET.PAYIN.AMOUNT",
        slot: 16,
        details: [
          "Số tiền cố định cho từng dòng payin settlement.",
          "Nếu field này có giá trị, routine split amount sẽ ưu tiên amount tuyệt đối thay vì tính theo phần trăm."
        ]
      },
      {
        name: "AA.SET.PAYIN.ACTIVITY",
        slot: 17,
        details: [
          "Activity cho phép dùng account hoặc beneficiary đó ở nhánh payin.",
          "Field này được dùng trong các flow offset hoặc non-financial validation để kiểm tra setup settlement có hợp lệ không."
        ]
      },
      {
        name: "AA.SET.PAYOUT.PPTY.CLASS",
        slot: 23,
        details: [
          "Property class đích của nhánh payout.",
          "Validate và overrides đọc field này để biết payout đang đi vào `ACCOUNT`, `INTEREST`, `CHARGE` hay property class khác."
        ]
      },
      {
        name: "AA.SET.PAYOUT.PROPERTY",
        slot: 24,
        details: [
          "Property cụ thể sẽ nhận payout.",
          "Các action settlement dùng field này để build linked activity hoặc accounting cho đúng property đích."
        ]
      },
      {
        name: "AA.SET.PAYOUT.SETTLE.ACTIVITY",
        slot: 25,
        details: [
          "Activity settle ở nhánh payout.",
          "Validate có thể điền mặc định field này từ settlement setup giống như payin side."
        ]
      },
      {
        name: "AA.SET.PAYOUT.ACCOUNT",
        slot: 27,
        details: [
          "Account nội bộ sẽ nhận hoặc trả tiền ở payout side.",
          "Trong `PAY.PROCESSING`, field này là nguồn để build settlement instruction và resolve accounting entry."
        ]
      },
      {
        name: "AA.SET.DEFAULT.SETTLEMENT.ACCOUNT",
        slot: 47,
        details: [
          "Account mặc định để counter-booking khi payin không chỉ rõ account khả dụng.",
          "Trong `DUE.PROCESSING`, nếu field này có giá trị thì routine dùng nó làm `COUNTER.BOOKING.ACCOUNT`."
        ]
      },
      {
        name: "AA.SET.UPDATE.PENDING.RETRY",
        slot: 48,
        details: [
          "Cờ cho phép update pending retry khi settlement account thay đổi ở future date.",
          "Trong `AA.SETTLEMENT.UPDATE.b`, field này được dùng để quyết định có gọi RC routine và giữ pending retry hay không."
        ]
      }
    ],
    actions: [
      {
        name: "SETTLE SETTLEMENT",
        routine: "AA.SETTLEMENT.SETTLE.b",
        summary: "Orchestration layer của settlement; điều phối pay processing và due processing chứ không trực tiếp split tiền ở mọi nhánh.",
        steps: [
          "Bước 1: routine lấy context activity, linked activity, settlement array và xác định payment type đang chạy.",
          "Bước 2: nếu flow hiện tại là due-side settlement, routine chuyển sang `AA.SETTLEMENT.DUE.PROCESSING.b`.",
          "Bước 3: nếu flow hiện tại là payout-side settlement, routine chuyển sang `AA.SETTLEMENT.PAY.PROCESSING.b`.",
          "Bước 4: sau khi routine lõi trả về, file orchestration tiếp tục xử lý error, accounting queue và linked activity nếu cần."
        ],
        flow: [
          "File này chủ yếu điều phối, không phải nơi sâu nhất để xem split account và update amount."
        ]
      },
      {
        name: "DUE.PROCESSING SETTLEMENT",
        routine: "AA.SETTLEMENT.DUE.PROCESSING.b",
        summary: "Routine lõi phía payin/due: đọc settlement instruction, split amount theo account, update activity balances và kích hoạt activity phụ.",
        steps: [
          "Bước 1: routine đọc `SETTLEMENT.ARRAY`, posting restriction, account list, debit-credit rule và settlement option của từng dòng payin.",
          "Bước 2: `DETERMINE.SETTLE.AMOUNT` xác định số tiền cần settle; nếu là payoff thì gọi `AA.Settlement.GetPayoffAmount(...)`, nếu là charge handoff hoặc capitalise thì đi nhánh amount riêng, còn bình thường thì gọi `AA.Settlement.GetPayDueBalances(...)`.",
          "Bước 3: `PARSE.ACCT.BALANCE.DUES` và `AA.Settlement.DetermineSettleDueAmounts(...)` chia amount theo account, balance và due item cần settle.",
          "Bước 4: routine kiểm tra account hợp lệ, có thể derive counter-booking account hoặc derive payin account mặc định nếu settlement line không cung cấp đủ account.",
          "Bước 5: `PROCESS.ACTIVITY.BALANCE` và `UPDATE.ACTIVITY.BALANCE` đọc hoặc build `AA.ACTIVITY.BALANCES`, rồi ghi lại phần due đã settle.",
          "Bước 6: `RESOLVE.ACCOUNTING.ENTRIES` dựng accounting phù hợp và `TRIGGER.ACTIVITY` append secondary activity payout hoặc apply payment khi còn flow nối tiếp."
        ],
        flow: [
          "Đọc `SETTLEMENT.ARRAY`, posting restriction và due balance hiện tại.",
          "Đọc/ghi `AA.ACTIVITY.BALANCES` trong cả nhánh update và reverse.",
          "Có thể tạo secondary activity sau khi split xong."
        ]
      },
      {
        name: "PAY.PROCESSING SETTLEMENT",
        routine: "AA.SETTLEMENT.PAY.PROCESSING.b",
        summary: "Routine lõi phía payout: chia amount theo settlement instruction, build activity balances và gọi linked activity để trả tiền ra ngoài hoặc sang arrangement khác.",
        steps: [
          "Bước 1: routine đọc settlement instruction từ `SETTLEMENT.ARRAY`, linked activity hiện tại và payout account tương ứng.",
          "Bước 2: kiểm tra posting restriction của account payout và xác định split amount bằng `AA.Settlement.DetermineSplitAmount(...)`.",
          "Bước 3: build hoặc đọc lại `AA.ACTIVITY.BALANCES` để biết amount nào đang được trả ra theo từng account hoặc destination.",
          "Bước 4: resolve accounting entry cho payout side, gồm debit-credit target, contra target và value date theo instruction đã split.",
          "Bước 5: trigger secondary activity payout hoặc apply payment để nhánh downstream thực hiện payment thực tế."
        ],
        flow: [
          "Đọc `SETTLEMENT.ARRAY` và `AA.ACTIVITY.BALANCES`.",
          "Cập nhật `AA.ACTIVITY.BALANCES` và linked activity chain.",
          "Ghi accounting theo payout split đã tính."
        ]
      }
    ]
  }
};
