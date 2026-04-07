import type { PropertyClass } from "@/lib/property-data";

export const manualNextOverrides: Record<string, PropertyClass> = {
  payoff: {
    name: "PAYOFF",
    slug: "payoff",
    fields: [
      {
        name: "AA.POFF.EXPIRY.DAYS",
        slot: 3,
        details: [
          "Số ngày làm việc mà payoff bill còn hiệu lực trước khi phải bị hủy.",
          "Action `ISSUE` dùng field này để schedule `CANCEL-PAYOFF` trên ngày hết hiệu lực."
        ]
      },
      {
        name: "AA.POFF.SETTLE.ACT",
        slot: 4,
        details: [
          "Activity thứ cấp dùng để xử lý settle payoff.",
          "Trong `AA.PAYOFF.SETTLE.b`, nếu field này trống thì routine tự suy ra `DEBIT.SETTLE` hoặc `CREDIT.SETTLE` từ payoff info bill."
        ]
      },
      {
        name: "AA.POFF.SETTLE.DUES",
        slot: 5,
        details: [
          "Cờ cho biết payoff có kéo luôn các khoản due cần settle hay không.",
          "Field này quyết định payoff flow có phải xử lý thêm due item bằng activity phụ hay chỉ settle chính payoff bill."
        ]
      },
      {
        name: "AA.POFF.SETTLE.DUE.ACT",
        slot: 6,
        details: [
          "Activity dùng riêng cho settle dues đi kèm payoff.",
          "Field này đi song song với `SETTLE.DUES` để tách nhánh settle các due item khỏi nhánh settle payoff bill."
        ]
      },
      {
        name: "AA.POFF.TOLERANCE.PERCENT",
        slot: 7,
        details: [
          "Tỷ lệ sai lệch cho phép giữa số tiền settle và số payoff phải trả.",
          "Field này đi cùng `TOLERANCE.CCY`, `TOLERANCE.AMOUNT`, `TOLERANCE.ACTION` để quyết định payoff có được chấp nhận hay phải write off phần lệch."
        ]
      },
      {
        name: "AA.POFF.TOLERANCE.AMOUNT",
        slot: 9,
        details: [
          "Số tiền tolerance tuyệt đối cho payoff.",
          "Nếu chênh lệch nằm trong ngưỡng này, hệ thống có thể đi theo `TOLERANCE.ACTION` thay vì từ chối settle."
        ]
      },
      {
        name: "AA.POFF.TOLERANCE.ACTION",
        slot: 10,
        details: [
          "Hành động xử lý phần chênh trong tolerance; source hiện thấy option `WRITE.OFF`.",
          "Field này là cầu nối giữa kiểm tra tolerance và write-off logic khi settle payoff."
        ]
      }
    ],
    actions: [
      {
        name: "CALCULATE PAYOFF",
        routine: "AA.PAYOFF.CALCULATE.b",
        summary: "Tạo payoff bill bằng cách gom bill chưa settle, tính current, due, overdue, per-diem và các khoản payoff đặc thù vào một bill tổng.",
        steps: [
          "Bước 1: routine lấy context activity, arrangement, payoff property, transaction amount, trạng thái charge-off và closure cooling setup.",
          "Bước 2: ở nhánh input, routine tính expiry date rồi đi vào xử lý payoff bill; source mô tả rõ bill payoff sẽ gồm các payment type `PAYOFF$CURRENT`, `PAYOFF$DUE`, `PAYOFF$OVERDUE`, `PAYOFF$PERDIEM`, `PAYOFF$PAY`, `PAYOFF$INV.DUE`.",
          "Bước 3: routine đọc `AA.BILL.DETAILS` và `AA.ACCOUNT.DETAILS`, gom tất cả bill chưa settle, đồng thời lấy current amount của property class `ACCOUNT`, `INTEREST`, `CHARGE` để bổ sung vào payoff bill.",
          "Bước 4: nếu activity payoff thực chất là settle payoff hoặc auto settle, reverse path gọi `REVERSE.EXISTING.BILL.UPDATE` rồi `AA.Payoff.DeletePayoffBill(...)` để xóa payoff bill hiện có.",
          "Bước 5: routine xử lý cả cooling-period waiver, charge-off subtype và các nhánh payoff activity để quyết định có tạo lại payoff bill hay không."
        ],
        flow: [
          "Đọc `AA.BILL.DETAILS`, `AA.ACCOUNT.DETAILS`, current balances của `ACCOUNT`, `INTEREST`, `CHARGE`.",
          "Xóa payoff bill cũ qua `AA.Payoff.DeletePayoffBill(...)` khi reverse.",
          "Kết quả chính là một payoff bill tổng để `ISSUE` và `SETTLE` dùng tiếp."
        ]
      },
      {
        name: "ISSUE PAYOFF",
        routine: "AA.PAYOFF.ISSUE.b",
        summary: "Chuyển payoff bill đã tính ở simulation sang live, cập nhật bill/property amount và schedule activity cancel-payoff.",
        steps: [
          "Bước 1: routine đọc account details từ simulation hoặc common, sau đó gọi `GET.BILL` để lấy bill payoff theo `BILL.TYPE = PAYOFF` và `PAYMENT.METHOD = INFO`.",
          "Bước 2: `CHECK.PAYOFF.ISSUE.REQD` quyết định có thực sự phải issue bill hay không; nếu live đã có payoff bill thì routine có thể xóa bill cũ trước bằng `AA.Payoff.DeletePayoffBill(...)`.",
          "Bước 3: routine đọc chi tiết bill từ `AA.BILL.DETAILS$SIM` hoặc live bằng `AA.PaymentSchedule.GetBillDetails(...)`.",
          "Bước 4: ghi payoff bill vào live bằng `AA.PaymentSchedule.UpdateBillDetails(...)`, rồi cập nhật amount property trên bill bằng `AA.PaymentSchedule.UpdateBillPropertyAmount(...)`.",
          "Bước 5: tính expiry date từ `EXPIRY.DAYS`, form activity id `CANCEL-PAYOFF`, rồi update `AA.SCHEDULED.ACTIVITY` bằng `AA.Framework.SetScheduledActivity(...)`.",
          "Bước 6: với facility hoặc sub-arrangement, routine còn build secondary `ISSUE-PAYOFF` cho child arrangement qua `AA.Framework.SecondaryActivityManager(...)`."
        ],
        flow: [
          "Đọc và ghi `AA.BILL.DETAILS`.",
          "Đọc/khôi phục `AA.ACCOUNT.DETAILS` từ simulation context.",
          "Cập nhật `AA.SCHEDULED.ACTIVITY` cho `CANCEL-PAYOFF`."
        ]
      },
      {
        name: "SETTLE PAYOFF",
        routine: "AA.PAYOFF.SETTLE.b",
        summary: "Dựng activity settle thứ cấp cho payoff bill và truyền đúng transaction amount, offset amount và local amount sang flow settlement.",
        steps: [
          "Bước 1: routine đọc payoff property hiện tại, product line, initiation type, activity object và, nếu là lending hoặc facility, maturity date từ `TERM.AMOUNT`.",
          "Bước 2: ở nhánh input, routine validate facility payoff; nếu activity không do `USER` hoặc `SCHEDULED*EOD` kích hoạt thì tiếp tục xử lý để tránh double entry.",
          "Bước 3: nếu `SETTLE.ACT` chưa có, routine đọc payoff info bill bằng `AA.PaymentSchedule.GetBill(...)` và `GetBillDetails(...)`; dựa vào `BdPaymentIndicator` của bill để tự chọn `DEBIT.SETTLE` hoặc `CREDIT.SETTLE`.",
          "Bước 4: `BUILD.ACTIVITY.RECORD` dựng `AAA.REC` với arrangement, activity, effective date, currency, transaction contract id, company code, linked activity và transaction amount.",
          "Bước 5: để lấy transaction amount thật, routine có thể gọi `AA.Payoff.GetPayoffOffsetAmount(...)` rồi cộng offset amount vào `ArrActTxnAmount`; sau đó quy đổi local amount bằng `ST.ExchangeRate.MiddleRateConvCheck(...)`.",
          "Bước 6: cuối cùng routine append activity settle thứ cấp qua `AA.Framework.SecondaryActivityManager(...)` và cycle activity hiện tại."
        ],
        flow: [
          "Đọc payoff info bill từ `AA.BILL.DETAILS`.",
          "Không ghi bill trực tiếp trong file này.",
          "Tạo secondary activity settle payoff với amount và local amount đã chuẩn hóa."
        ]
      },
      {
        name: "CANCEL PAYOFF",
        routine: "AA.PAYOFF.CANCEL.b",
        summary: "Hủy payoff bill hết hiệu lực, xóa bill details và dọn các update schedule/account-details liên quan.",
        steps: [
          "Bước 1: routine lấy payoff bill đang hiệu lực của arrangement.",
          "Bước 2: xóa hoặc invalidate payoff bill đã issue trước đó.",
          "Bước 3: xóa update của payoff bill trong `AA.ACCOUNT.DETAILS`.",
          "Bước 4: cập nhật `AA.SCHEDULED.ACTIVITY` để đánh dấu cancel-payoff đã được xử lý."
        ],
        flow: [
          "Đụng trực tiếp `AA.BILL.DETAILS`, `AA.ACCOUNT.DETAILS` và `AA.SCHEDULED.ACTIVITY`."
        ]
      },
      {
        name: "UPDATE PAYOFF",
        routine: "AA.PAYOFF.UPDATE.b",
        summary: "Wrapper theo dõi condition change của property payoff.",
        steps: [
          "Bước 1: routine lấy context activity của payoff.",
          "Bước 2: gọi generic change-condition processing cho property payoff.",
          "Bước 3: xử lý error và log."
        ],
        flow: [
          "Không phải routine bill-processing hay settlement-processing lõi."
        ]
      }
    ]
  },
  closure: {
    name: "CLOSURE",
    slug: "closure",
    fields: [
      {
        name: "AA.CLS.CLOSURE.TYPE",
        slot: 3,
        details: [
          "Kiểu đóng arrangement: `MATURITY`, `BALANCE` hoặc `DEFER.CLOSURE`.",
          "Field này quyết định action evaluate và close sẽ schedule closure như thế nào."
        ]
      },
      {
        name: "AA.CLS.CLOSURE.PERIOD",
        slot: 4,
        details: [
          "Khoảng thời gian chờ hoặc tính toán để closure đến hạn.",
          "Field này là đầu vào cho evaluate/schedule closure chứ không chỉ là mô tả tĩnh."
        ]
      },
      {
        name: "AA.CLS.CLOSURE.METHOD",
        slot: 5,
        details: [
          "Cách đóng arrangement là `MANUAL` hay `AUTOMATIC`.",
          "Trong `AA.CLOSURE.EVALUATE.b`, field này quyết định có update `AA.SCHEDULED.ACTIVITY` tự động hay không."
        ]
      },
      {
        name: "AA.CLS.POSTING.RESTRICT",
        slot: 6,
        details: [
          "Posting restriction sẽ được gắn lên record `ACCOUNT.CLOSURE` khi arrangement đóng.",
          "Nếu người dùng không nhập, `AA.CLOSURE.CLOSE.b` có thể mặc định giá trị `90`."
        ]
      },
      {
        name: "AA.CLS.CLOSURE.ACTIVITY",
        slot: 7,
        details: [
          "Activity hợp lệ để thực hiện manual closure.",
          "Field này là cầu nối giữa property closure và AAA dùng để đóng arrangement chủ động."
        ]
      },
      {
        name: "AA.CLS.CLOSE.ONLINE",
        slot: 8,
        details: [
          "Cờ cho phép online closure khi dues đã settle.",
          "Nếu field này là `YES`, `AA.CLOSURE.CLOSE.b` ghi `AclCloseOnline = Y` vào `ACCOUNT.CLOSURE`."
        ]
      },
      {
        name: "AA.CLS.COOLING.PERIOD",
        slot: 9,
        details: [
          "Khoảng cooling period trước khi một số charge hoặc interest được waive khi payoff hoặc closure.",
          "Field này được đọc lại từ property `CLOSURE` trong nhiều routine payoff/activity-charges."
        ]
      },
      {
        name: "AA.CLS.DEFER.CLOSURE.PERIOD",
        slot: 11,
        details: [
          "Số kỳ hoãn closure; field này `NOCHANGE` sau khi được set.",
          "Trong `AA.CLOSURE.EVALUATE.b`, nếu account details có `DeferClosureDate` lớn hơn effective date hiện tại thì routine dừng xử lý."
        ]
      },
      {
        name: "AA.CLS.COOLING.WAIVE.CLASS",
        slot: 12,
        details: [
          "Property class được phép waive trong cooling period, hiện source cho thấy class chính là `INTEREST` hoặc `CHARGE`.",
          "Field này đi cùng `COOLING.WAIVE.PROP` và `WAIVE.BILL.TYPE`."
        ]
      },
      {
        name: "AA.CLS.WAIVE.BILL.TYPE",
        slot: 14,
        details: [
          "Loại bill được waive trong cooling-period closure, như `CURRENT`, `BILLED`, `ALL`.",
          "Routine cooling-waive sẽ dùng field này để quyết định property charge nào không bị raise khi settle payoff."
        ]
      }
    ],
    actions: [
      {
        name: "CLOSE CLOSURE",
        routine: "AA.CLOSURE.CLOSE.b",
        summary: "Validate dues đã settle, dựng record `ACCOUNT.CLOSURE`, dọn settlement/beneficiary links và trigger mature flow khi cần.",
        steps: [
          "Bước 1: routine đọc arrangement, linked account và trạng thái activity hiện tại; gọi `AA.Framework.GetArrangementAccountId(...)` để lấy account số thật của arrangement.",
          "Bước 2: gọi `AA.Closure.DetermineDueAmount(...)` để xác định `DUE.SETTLED`; nếu là direct account closure còn gọi `AA.Payoff.ValidateAccountClosure(...)` để kiểm tra linkages trên account.",
          "Bước 3: nếu closure được phép, routine cập nhật `R.ACCOUNT.CLOSURE` với `AclClosureReason`, `AclClosureNotes`, `AclPostingRestrict`, `AclCloseOnline`.",
          "Bước 4: ở input stage, nếu zero-auth và không có override chờ duyệt, routine gọi `PROCESS.ACCOUNT.CLOSURE` để tạo record `ACCOUNT.CLOSURE`; ở auth stage cũng có thể create hoặc reverse record tương ứng.",
          "Bước 5: auth stage gọi `AA.Settlement.SettlementBlockClosureUpdate(...)`, maintain beneficiary links, update CRA details, bundle hierarchy và dormancy handoff.",
          "Bước 6: nếu còn total commitment hoặc là external financial arrangement, routine build secondary `MATURE` activity; với facility master còn gọi `AA.TermAmount.TermAmountCreateFacilityActivity(...)`."
        ],
        flow: [
          "Đọc arrangement và due state.",
          "Ghi `ACCOUNT.CLOSURE` record qua OFS/account-closure processing.",
          "Đụng beneficiary links, bundle hierarchy, dormancy handoff và settlement-block-closure update."
        ]
      },
      {
        name: "EVALUATE CLOSURE",
        routine: "AA.CLOSURE.EVALUATE.b",
        summary: "Đánh giá có cần schedule hoặc trigger close-arrangement activity hay không dựa trên method, due state, queue state và defer-closure date.",
        steps: [
          "Bước 1: routine đọc `AA.ACCOUNT.DETAILS`, activity class, initiation type, payoff-processing flag và defer closure date.",
          "Bước 2: gọi `AA.Closure.DetermineQueueStatus(...)` rồi lọc các queue message như `RECALCULATE`, `DISCOUNT.MAKEDUE`, `ISSUE.ORDER`; nếu queue còn invalid thì không xử lý closure evaluate.",
          "Bước 3: gọi `AA.Closure.DetermineClosureRestriction(...)` để lấy `CHECK.DUES.SETTLED`, `WRITE.OFF`, `UPD.STATUS`; nếu technical-loan/original-loan chưa đủ điều kiện thì dừng.",
          "Bước 4: nếu có `DeferClosureDate` và effective date còn nhỏ hơn ngày đó thì routine dừng hoàn toàn.",
          "Bước 5: khi được phép chạy, routine update `AA.SCHEDULED.ACTIVITY` của `CLOSE-ARRANGEMENT`; với `CLOSURE.METHOD = MANUAL`, source comment cho thấy có nhánh riêng cho `ACCOUNTS-CLOSE-ARRANGEMENT`."
        ],
        flow: [
          "Đọc `AA.ACCOUNT.DETAILS` và state queue/arrangement.",
          "Cập nhật `AA.SCHEDULED.ACTIVITY` của close arrangement khi đủ điều kiện."
        ]
      },
      {
        name: "UPDATE.GUARD CLOSURE",
        routine: "AA.CLOSURE.UPDATE.GUARD.b",
        summary: "Guard method quyết định khi nào `UPDATE CLOSURE` thực sự được phép trigger.",
        steps: [
          "Bước 1: nhận activity class, property, action và effective date hiện tại.",
          "Bước 2: kiểm tra một số activity như disburse hoặc auto-disburse có thực sự cần update closure hay không.",
          "Bước 3: nếu base-date/start-date chưa đổi theo điều kiện guard thì routine chặn trigger update closure."
        ],
        flow: [
          "Routine guard, không phải nơi ghi nghiệp vụ closure."
        ]
      },
      {
        name: "UPDATE CLOSURE",
        routine: "AA.CLOSURE.UPDATE.b",
        summary: "Wrapper update condition cho property closure.",
        steps: [
          "Bước 1: lấy context activity hiện tại.",
          "Bước 2: chạy generic update/change-condition processing của property closure.",
          "Bước 3: xử lý error và log."
        ],
        flow: [
          "Không phải routine close-account lõi."
        ]
      }
    ]
  },
  "payout-rules": {
    name: "PAYOUT.RULES",
    slug: "payout-rules",
    fields: [
      {
        name: "AA.PAYOUT.APPLICATION.TYPE",
        slot: 3,
        details: [
          "Loại payout rule, check sang `AA.PAYMENT.RULE.TYPE`.",
          "Action `ALLOCATE` đọc thẳng field này để xác định cách phân bổ payout amount vào bill hoặc property."
        ]
      },
      {
        name: "AA.PAYOUT.APPLICATION.ORDER",
        slot: 4,
        details: [
          "Thứ tự apply payout, ví dụ `OLDEST.FIRST`, `OLDEST.LAST`.",
          "Field này quyết định bill/property nào nhận tiền trước trong `AllocatePaymentAmount(...)`."
        ]
      },
      {
        name: "AA.PAYOUT.SEQUENCE",
        slot: 5,
        details: [
          "Thứ tự xử lý trong cùng payout rule.",
          "Field này phối hợp với `APPLICATION.ORDER` để build order phân bổ cuối cùng."
        ]
      },
      {
        name: "AA.PAYOUT.PROPERTY",
        slot: 6,
        details: [
          "Property đích sẽ nhận payout amount.",
          "Khi update bill payment amounts, field này là khóa để ghi đúng amount của property trên bill."
        ]
      },
      {
        name: "AA.PAYOUT.BALANCE.TYPE",
        slot: 7,
        details: [
          "Balance type cụ thể bên dưới property đích.",
          "Field này được dùng khi payout không dừng ở amount tổng của property mà phải settle vào balance riêng."
        ]
      },
      {
        name: "AA.PAYOUT.PROP.APPL.TYPE",
        slot: 8,
        details: [
          "Hiện source cho thấy dùng option `BALANCES`.",
          "Điều này cho biết payout rule có thể áp ở mức balance thay vì toàn property."
        ]
      },
      {
        name: "AA.PAYOUT.REMAINDER.ACTIVITY",
        slot: 10,
        details: [
          "Activity xử lý phần payout còn dư sau khi phân bổ hết bill/property chính.",
          "Nếu còn `REMAINDER.AMOUNT`, routine allocate sẽ dựng secondary AAA từ chính field này."
        ]
      }
    ],
    actions: [
      {
        name: "ALLOCATE PAYOUT.RULES",
        routine: "AA.PAYOUT.RULES.ALLOCATE.b",
        summary: "Phân bổ payout amount vào bill/property, cập nhật bill payment amounts và dựng secondary activity cho remainder hoặc auto-disbursement.",
        steps: [
          "Bước 1: routine lấy `PAYOUT.AMOUNT`, `PAYOUT.AMOUNT.LCY`, `PAYOUT.EXCHRATE` từ AAA; ở `DELETE-REV` dùng `OrigTxnAmt`, còn bình thường dùng `TxnAmount`.",
          "Bước 2: đọc `APPLICATION.TYPE` và `APPLICATION.ORDER`, rồi gọi `AA.PaymentRules.AllocatePaymentAmount(...)` để sinh `BILL.REFERENCE`, `BILL.PROPERTY`, `BILL.PROPERTY.DUE.AMOUNT`, `BILL.PROPERTY.PAYOUT.AMOUNT`, `REMAINDER.AMOUNT`, `BILL.PROPERTY.AMOUNT.LCY`, `DISBURSEMENT.BILL.AMT`.",
          "Bước 3: nếu bill đã có payout amount, routine gọi `AA.PayoutRules.UpdateBillPaymentAmounts(...)` để ghi lại payment amount trên bill.",
          "Bước 4: nếu còn `REMAINDER.AMOUNT`, routine dựng `AAA.REC` mới với `ArrActTxnAmount`, `ArrActTxnAmountLcy`, `ArrActTxnExchRate`, `ArrActLinkedActivity`, rồi append secondary activity remainder.",
          "Bước 5: nếu có `DISBURSEMENT.BILL.AMT`, routine build thêm secondary `AUTO.DISBURSE`; khi reverse hoặc delete, routine đọc các bill đã repay bằng repayment reference rồi đảo `UpdateBillPaymentAmounts(...)`."
        ],
        flow: [
          "Đọc AAA hiện tại và bill list hiện hành.",
          "Cập nhật `AA.BILL.DETAILS` gián tiếp qua `AA.PayoutRules.UpdateBillPaymentAmounts(...)`.",
          "Tạo secondary activity remainder và auto-disbursement."
        ]
      },
      {
        name: "UPDATE PAYOUT.RULES",
        routine: "AA.PAYOUT.RULES.UPDATE.b",
        summary: "Wrapper update condition cho payout rules.",
        steps: [
          "Bước 1: lấy context activity.",
          "Bước 2: chạy generic update/change-condition processing cho property payout rules.",
          "Bước 3: xử lý error và log."
        ],
        flow: [
          "Không phải routine payout allocation lõi."
        ]
      }
    ]
  },
  overdue: {
    name: "OVERDUE",
    slug: "overdue",
    fields: [
      {
        name: "AA.OD.BILL.TYPE",
        slot: 3,
        details: [
          "Loại bill mà overdue rule áp dụng.",
          "Mỗi `BILL.TYPE` có thể có một tập overdue status riêng để `CHANGE.STATUS` tính lại."
        ]
      },
      {
        name: "AA.OD.OVERDUE.STATUS",
        slot: 9,
        details: [
          "Status overdue lấy từ virtual table `AA.OVERDUE.STATUS`.",
          "Đây là trạng thái hệ thống sẽ set vào bill hoặc arrangement khi age lên hoặc age xuống."
        ]
      },
      {
        name: "AA.OD.AGEING.TYPE",
        slot: 10,
        details: [
          "Cách age là theo số ngày (`DAYS`) hay theo bill sequence (`BILLS`).",
          "Field này quyết định `CHANGE.STATUS` phải tính lại toàn bộ unpaid bills hay chỉ xét age-all-bills."
        ]
      },
      {
        name: "AA.OD.AGEING",
        slot: 11,
        details: [
          "Ngưỡng ngày hoặc logic tuổi nợ cho status hiện tại.",
          "Routine overdue dùng field này để tính `NEW.AGING.STATUS` và `NEXT.AGING.DATE`."
        ]
      },
      {
        name: "AA.OD.NOTICE.DAYS",
        slot: 12,
        details: [
          "Số ngày trước khi phát sinh notice hoặc chaser cho overdue status.",
          "Field này đi cùng `NOTICE.FREQ` để build lịch chaser."
        ]
      },
      {
        name: "AA.OD.NOTICE.FREQ",
        slot: 13,
        details: [
          "Tần suất lặp notice/chaser khi bill ở overdue status này.",
          "Field này được khai báo kiểu `FQU` extended nên là thông số recurrence thật, không phải mô tả."
        ]
      },
      {
        name: "AA.OD.MANUAL.CHANGE",
        slot: 19,
        details: [
          "Cờ đổi overdue bằng tay, hiện source đánh dấu `NOINPUT`.",
          "Điều đó cho thấy field này được hệ thống giữ lại cho trạng thái manual chứ người dùng không nhập trực tiếp."
        ]
      }
    ],
    actions: [
      {
        name: "CHANGE.STATUS OVERDUE",
        routine: "AA.OVERDUE.CHANGE.STATUS.b",
        summary: "Tính lại overdue status của bill và arrangement khi repay, adjust, write-off hoặc update overdue condition.",
        steps: [
          "Bước 1: routine đọc `AA.ACCOUNT.DETAILS`, lấy từng `BILL.TYPE` trong property overdue, rồi xác định `AGE.BY.DAYS` hay age-by-bills.",
          "Bước 2: nếu activity là `APPLYPAYMENT`, `ADJUST.BILL`, `ADJUST.ALL`, `WRITE.OFF`, `WRITE.OFF.BILL`, routine lấy các bill đã repay hoặc adjusted bằng `AA.PaymentSchedule.GetBill(...)`; nếu là `UPDATE-OVERDUE` thì lấy bill unpaid.",
          "Bước 3: routine đọc từng `BILL.DETAILS`, kiểm tra `STATUS.MVMT`, lấy property record trước đó nếu current overdue definition không còn status cũ, rồi quyết định có cần change status hay không.",
          "Bước 4: nếu phải xử lý, routine tính `NEW.AGING.STATUS` và `NEW.AGING.DATE`, update bill qua `AA.PaymentSchedule.UpdateBill(...)`, đồng bộ lại `AA.ACCOUNT.DETAILS` và overdue stats.",
          "Bước 5: nếu trạng thái chuyển từ suspend sang non-suspend, routine có thể append secondary `RESUME`; nếu bill phải age tiếp thì append secondary `AGE-OVERDUE*<status>*<billtype>`."
        ],
        flow: [
          "Đọc/ghi `AA.BILL.DETAILS` qua `GetBill(...)`, `GetBillDetails(...)`, `UpdateBill(...)`.",
          "Đọc/ghi `AA.ACCOUNT.DETAILS` để giữ `ArrAgeStatus`, `AllAgeStatus`, `BillStatus` đồng bộ.",
          "Có thể tạo secondary activity `AGE` và `RESUME`."
        ]
      },
      {
        name: "AGE.CAP.BILLS OVERDUE",
        routine: "AA.OVERDUE.AGE.CAP.BILLS.b",
        summary: "Xử lý aging riêng cho các capitalised bills trong flow overdue.",
        steps: [
          "Bước 1: routine lấy các capitalised bills cần age.",
          "Bước 2: tính overdue status mới cho bill capitalised theo setup overdue hiện hành.",
          "Bước 3: update bill/account details và overdue stats tương ứng."
        ],
        flow: [
          "Đụng trực tiếp bill capitalised và overdue status liên quan."
        ]
      }
    ]
  },
  accounting: {
    name: "ACCOUNTING",
    slug: "accounting",
    fields: [
      {
        name: "AA.ACP.PROPERTY",
        slot: 3,
        details: [
          "Property có setup accounting riêng.",
          "Accounting manager sẽ dùng field này để lấy đúng accounting rule, contra target và booking category."
        ]
      },
      {
        name: "AA.ACP.ACCT.ACTION",
        slot: 5,
        details: [
          "Action trong property cần map accounting.",
          "Field này kết hợp với `PROPERTY` để locate đúng dòng accounting details."
        ]
      },
      {
        name: "AA.ACP.ACCT.RULE",
        slot: 8,
        details: [
          "Allocation rule của soft accounting, check sang `AC.ALLOCATION.RULE`.",
          "Accounting manager lấy field này để gọi lớp soft accounting và phân bổ entry thật."
        ]
      },
      {
        name: "AA.ACP.BOOKING.CM",
        slot: 9,
        details: [
          "Booking category cho current month.",
          "Field này quyết định entry accrual hoặc booking hiện tại đi vào PL/category nào."
        ]
      },
      {
        name: "AA.ACP.BOOKING.PM",
        slot: 11,
        details: [
          "Booking category cho previous month.",
          "Manager dùng field này khi event đang thuộc split previous-month accrual."
        ]
      },
      {
        name: "AA.ACP.BOOKING.PY",
        slot: 12,
        details: [
          "Booking category cho previous year.",
          "Field này dùng khi entry accrual phải đi về previous-year bucket."
        ]
      },
      {
        name: "AA.ACP.NEG.BOOKING.CM",
        slot: 13,
        details: [
          "Booking category riêng cho current-month accrual âm.",
          "Field này tách hẳn khỏi booking dương để hạch toán negative rate hoặc negative accrual."
        ]
      },
      {
        name: "AA.ACP.CHARGEOFF.CATEGORY",
        slot: 16,
        details: [
          "Category dùng cho accounting charge-off.",
          "Các action chargeoff hoặc payoff chargeoff đọc field này để chọn P&L/internal target phù hợp."
        ]
      },
      {
        name: "AA.ACP.ACCRUE.AMORT",
        slot: 19,
        details: [
          "Setup accounting cho flow accrual hoặc amortisation.",
          "Field này liên kết trực tiếp với các action interest/charge khi build event `ACCRUE` hoặc `AMORT`."
        ]
      }
    ],
    actions: [
      {
        name: "MANAGER ACCOUNTING",
        routine: "AA.ACCOUNTING.MANAGER.b",
        summary: "Routine trung tâm build, enrich, soft-map và store accounting entries cho toàn bộ AA action routines.",
        steps: [
          "Bước 1: routine kiểm tra argument bắt buộc `TYPE`, `PROPERTY`, `ACTION`, `DATE`; nếu thiếu property/action/date thì lấy mặc định từ context activity hiện tại.",
          "Bước 2: nếu property class là `INTEREST`, routine đọc property record để check `MEMO.ONLY`; trong batch + zero auth, routine có thể đổi accounting mode sang `SAO` theo context `ACCOUNTING.MODE` trên AAA.",
          "Bước 3: với các mode `VAL`, `REV`, `COB`, `SAO`, `ADD`, routine lặp từng `ACCT.EVENT.ARRAY`, kiểm tra amount/sign bắt buộc, build event info, base info, exchange rate, local equivalent, exposure date.",
          "Bước 4: routine lấy accounting details bằng `AA.Accounting.GetAccountingDetails(...)`, locate dòng theo `PROPERTY` và `ACTION`, rồi update contra target, booking company, transaction codes và local references.",
          "Bước 5: sau khi gom `MULTI.EVENT.ENTRIES`, routine gọi soft accounting để hoàn tất mapping balance type, posting rule và real account target.",
          "Bước 6: cuối cùng routine update local ref/our reference và store accounting qua `AA.Accounting.StoreAccounting(...)`."
        ],
        flow: [
          "Đọc AAA context, accounting property setup và property record.",
          "Có thể tính exchange rate/local amount nếu entry chưa có LCY.",
          "Ghi accounting store qua `AA.Accounting.StoreAccounting(...)` sau soft accounting."
        ]
      },
      {
        name: "ACTION.DETAILS ACCOUNTING",
        routine: "AA.ACCOUNTING.ACTION.DETAILS.b",
        summary: "Routine hard-coded trả ra balance prefix, sign và subtype kỳ vọng cho từng activity/action của AA.",
        steps: [
          "Bước 1: nhận `ACTIVITY`, `PROPERTY.CLASS`, `PROPERTY`, `OVERDUE.STATUS`, `ACTION`.",
          "Bước 2: tra mapping hard-coded và trả về `DETAILS<1,x>` balance prefix, `DETAILS<2,x>` sign, `DETAILS<3,x>` subtype.",
          "Bước 3: layer accounting dùng kết quả này để biết phải build event nào cho activity/action đang chạy."
        ],
        flow: [
          "Routine tra mapping, không tự ghi entry."
        ]
      },
      {
        name: "ACTIVITY.ALLOCATE ACCOUNTING",
        routine: "AA.ACCOUNTING.ACTIVITY.ALLOCATE.b",
        summary: "Nhận accounting entry từ external application và map về AA activity/net movement tương ứng.",
        steps: [
          "Bước 1: routine nhận account id, account record và incoming entry.",
          "Bước 2: xác định activity tương ứng trong AA để xử lý movement đó.",
          "Bước 3: consolidate movement theo arrangement và activity để phát sinh activity AA phù hợp."
        ],
        flow: [
          "Routine bridge giữa entry ngoài và activity AA."
        ]
      },
      {
        name: "DISTRIBUTE ACCOUNTING",
        routine: "AA.ACCOUNTING.DISTRIBUTE.b",
        summary: "Quyết định entry phải đi suspense account hay AA account thật ở lớp phân phối accounting.",
        steps: [
          "Bước 1: routine nhận account id, account record, entry record và entry type.",
          "Bước 2: kiểm tra entry thuộc AA process nào.",
          "Bước 3: đổi target entry sang suspense hoặc AA account thật rồi trả lại entry list mới."
        ],
        flow: [
          "Routine phân phối target account cho entry."
        ]
      },
      {
        name: "POST.PROCESS ACCOUNTING",
        routine: "AA.ACCOUNTING.POST.PROCESS.b",
        summary: "Hậu xử lý entry list sau pre-processing của AA, giữ context đúng cho nested accounting calls.",
        steps: [
          "Bước 1: nhận loại accounting call và mảng entry đã được AA enrich.",
          "Bước 2: chỉnh sửa hoặc giữ context chung cho nested calls.",
          "Bước 3: đảm bảo `AA.ITEM.REF` và metadata activity vẫn đúng trước khi core accounting post tiếp."
        ],
        flow: [
          "Routine hậu xử lý entry, không phải nơi build rule accounting từ đầu."
        ]
      },
      {
        name: "UPDATE ACCOUNTING",
        routine: "AA.ACCOUNTING.UPDATE.b",
        summary: "Wrapper update condition của property accounting.",
        steps: [
          "Bước 1: lấy context activity.",
          "Bước 2: chạy generic update/change-condition cho property accounting.",
          "Bước 3: xử lý error và log."
        ],
        flow: [
          "Không phải manager xử lý accounting entries."
        ]
      }
    ]
  },
  "activity-charges": {
    name: "ACTIVITY.CHARGES",
    slug: "activity-charges",
    fields: [
      {
        name: "AA.ACT.CHG.ACTIVITY.ID",
        slot: 3,
        details: [
          "Activity sẽ bị áp activity charge.",
          "Routine `CALCULATE` locate chính field này để biết activity hiện tại có charge hay không."
        ]
      },
      {
        name: "AA.ACT.CHG.CHARGE",
        slot: 4,
        details: [
          "Property charge sẽ được raise khi activity này xảy ra.",
          "Field này được lặp qua từng subvalue để thêm record vào `AA.CHARGE.DETAILS`."
        ]
      },
      {
        name: "AA.ACT.CHG.APP.PERIOD",
        slot: 5,
        details: [
          "Kỳ áp charge cho activity charge.",
          "Field này được truyền thẳng vào `AA.ActivityCharges.AddChargeDetails(...)`."
        ]
      },
      {
        name: "AA.ACT.CHG.APP.METHOD",
        slot: 6,
        details: [
          "Cách áp charge: `DUE`, `CAPITALISE`, `DEFER`, `PAY`.",
          "Field này quyết định charge detail sinh ra sẽ được xử lý như loại bill/payment method nào."
        ]
      },
      {
        name: "AA.ACT.CHG.CHARGE.AUTO.SETTLE",
        slot: 7,
        details: [
          "Cờ auto settle riêng cho charge property này.",
          "Field này cho phép auto settle từng charge khác với auto settle chung của activity."
        ]
      },
      {
        name: "AA.ACT.CHG.PAYMENT.TYPE",
        slot: 8,
        details: [
          "Payment type đi cùng activity charge.",
          "Field này được truyền vào charge details để routing tiếp sang payment schedule hoặc settlement phù hợp."
        ]
      },
      {
        name: "AA.ACT.CHG.SETTLE.ACTIVITY",
        slot: 9,
        details: [
          "Activity settlement dùng cho activity charge.",
          "Field này là activity sẽ được gọi khi charge detail cần đi thẳng sang settlement."
        ]
      },
      {
        name: "AA.ACT.CHG.AUTO.SETTLE",
        slot: 10,
        details: [
          "Cờ auto settle ở cấp activity charge.",
          "Field này bổ sung cho `CHARGE.AUTO.SETTLE` để quyết định có cần activity settle theo charge không."
        ]
      }
    ],
    actions: [
      {
        name: "CALCULATE ACTIVITY.CHARGES",
        routine: "AA.ACTIVITY.CHARGES.CALCULATE.b",
        summary: "Sinh hoặc xóa activity charge details cho activity hiện tại, đồng thời xử lý cooling-period waive, handoff charge và evaluation details khi reverse.",
        steps: [
          "Bước 1: routine lấy `AAA.ID`, arrangement id, activity id, activity object, effective date và record `R.NEW` của `ACTIVITY.CHARGES`.",
          "Bước 2: `CHECK.ACTIVITY.CHARGES` locate activity hiện tại trong field `ACTIVITY.ID`; nếu activity là `SETTLE-PAYOFF` và còn trong cooling period thì bật cờ kiểm tra closure cooling waive.",
          "Bước 3: với từng charge của activity hiện tại, routine đọc `CHARGE.ID`, `APP.PERIOD`, `APP.METHOD`, `PAYMENT.TYPE`; nếu property không bị waive trong cooling period thì gọi `AA.ActivityCharges.AddChargeDetails(...)` để ghi charge vào `AA.CHARGE.DETAILS`.",
          "Bước 4: ở delete hoặc reverse, routine gọi `AA.ActivityCharges.ProcessChargeDetails(..., \"DELETE\", \"ACTIVITY\", ...)` để xóa charge details đã sinh theo `AAA.ID`.",
          "Bước 5: nếu charge là handoff charge, routine đọc property `CHARGE`, xác định handoff rồi gọi `AA.Framework.ProcessChargeHandoffDetails(..., \"REMOVE\", ...)` để xóa handoff record liên quan.",
          "Bước 6: nếu activity là `NEW` arrangement bị reverse, routine còn đọc activity history rồi xóa evaluation details bằng `AA.PricingRules.EvaluationDetailsDelete(...)`."
        ],
        flow: [
          "Đọc `AA.ACCOUNT.DETAILS` để lấy cooling date.",
          "Ghi/xóa `AA.CHARGE.DETAILS` qua `AA.ActivityCharges.AddChargeDetails(...)` và `ProcessChargeDetails(...)`.",
          "Có thể xóa charge handoff details và pricing evaluation details."
        ]
      },
      {
        name: "CALCULATE.COMM ACTIVITY.CHARGES",
        routine: "AA.ACTIVITY.CHARGES.CALCULATE.COMM.b",
        summary: "Routine common/hỗ trợ cho flow tính activity charges.",
        steps: [
          "Bước 1: chuẩn hóa context và charge input cho calculate.",
          "Bước 2: dùng chung trong các nhánh calculate hoặc guard để không lặp lại logic setup."
        ],
        flow: [
          "Routine helper, không phải nơi ghi charge details cuối cùng."
        ]
      },
      {
        name: "CALCULATE.GUARD ACTIVITY.CHARGES",
        routine: "AA.ACTIVITY.CHARGES.CALCULATE.GUARD.b",
        summary: "Guard method quyết định khi nào calculate activity charges được phép chạy.",
        steps: [
          "Bước 1: kiểm tra activity hiện tại có hợp lệ để phát sinh activity charge hay không.",
          "Bước 2: chặn các case không cần raise charge details dù property có setup."
        ],
        flow: [
          "Routine guard cho calculate."
        ]
      },
      {
        name: "UPDATE ACTIVITY.CHARGES",
        routine: "AA.ACTIVITY.CHARGES.UPDATE.b",
        summary: "Wrapper update condition của property activity charges.",
        steps: [
          "Bước 1: lấy context activity.",
          "Bước 2: chạy generic update/change-condition cho property activity charges.",
          "Bước 3: xử lý error và log."
        ],
        flow: [
          "Không phải routine sinh charge details."
        ]
      }
    ]
  }
};
