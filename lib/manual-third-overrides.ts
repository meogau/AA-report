import type { PropertyClass } from "@/lib/property-data";

export const manualThirdOverrides: Record<string, PropertyClass> = {
  chargeoff: {
    name: "CHARGEOFF",
    slug: "chargeoff",
    fields: [
      {
        name: "AA.CF.FINANCIAL.STATUS",
        slot: 3,
        details: [
          "Xác định bộ rule charge-off sẽ áp theo trạng thái tài chính của arrangement: `PERFORMING`, `SUSPENDED` hoặc `BOTH`.",
          "Trong `AA.CHARGEOFF.EVALUATE.b`, routine luôn thử locate giá trị `BOTH` trước; nếu không có thì gọi `AA.Framework.GetSuspendDetails(...)` để tự quyết định rơi vào nhánh `SUSPENDED` hay `PERFORMING`."
        ]
      },
      {
        name: "AA.CF.CHARGE.OFF.ORDER",
        slot: 4,
        details: [
          "Thứ tự lấy các khoản để tăng hoặc giảm charge-off: `OLDEST.FIRST` hoặc `NEWEST.FIRST`.",
          "Routine `AA.CHARGEOFF.EVALUATE.b` đọc field này vào biến `CHARGEOFF.ORDER`; các routine allocate bên dưới dùng nó để chọn nhóm balance/bill nào bị xử lý trước."
        ]
      },
      {
        name: "AA.CF.WRITEOFF.ORDER",
        slot: 5,
        details: [
          "Quy định phần write-off của ngân hàng đi trước hay đi sau: `BANK.FIRST` hoặc `BANK.LAST`.",
          "Field được định nghĩa ngay trong `FIELDS`; source action của batch này chưa thấy tự đọc trực tiếp ngoài các routine allocate/write-off chuyên sâu."
        ]
      },
      {
        name: "AA.CF.APPLICATION.TYPE",
        slot: 6,
        details: [
          "Loại rule phân bổ dùng khi áp số tiền thu hồi vào charge-off; field check sang `AA.PAYMENT.RULE.TYPE`.",
          "Trong `AA.CHARGEOFF.VALIDATE.b`, field này được đọc lại để kiểm tra cấu hình allocate có hợp lệ với phần balance/property charge-off."
        ]
      },
      {
        name: "AA.CF.APPLICATION.ORDER",
        slot: 7,
        details: [
          "Thứ tự áp rule khi field `APPLICATION.TYPE` cho phép phân bổ nhiều item, ví dụ `OLDEST.FIRST` hoặc `NEWEST.FIRST`.",
          "Nó đi cặp với `APPLICATION.TYPE`, tách riêng thứ tự allocate khỏi thứ tự chọn charge-off bucket."
        ]
      },
      {
        name: "AA.CF.BALANCE.PROPERTY",
        slot: 11,
        details: [
          "Danh sách property sẽ tham gia charge-off, lấy từ `AA.PROPERTY`.",
          "Trong `AA.CHARGEOFF.ALLOCATE.PAYMENT.b`, routine đếm số property bằng `DCOUNT(...)`, cắt danh sách bằng `FIELD(...)`, rồi dùng list này để update bill/property amount và charge-off details."
        ]
      },
      {
        name: "AA.CF.BALANCE.TYPE",
        slot: 15,
        details: [
          "Loại balance đi cùng từng property charge-off, chỉ nhận `BILLED`, `CURRENT`, `CHARGEOFF`.",
          "Field này là map giữa property charge-off và bucket số dư thực tế phải cập nhật trong bill hoặc activity balances."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE CHARGEOFF",
        routine: "AA.CHARGEOFF.UPDATE.b",
        summary: "Action mỏng, chỉ theo dõi thay đổi condition của property chargeoff cho các nhánh input, delete và reverse.",
        steps: [
          "Bước 1: `SET.ACTIVITY.DETAILS` đọc `R.ACTIVITY.STATUS`, `ARR.ACTIVITY.ID`, `R.ACTIVITY`, `ACTIVITY.ACTION`, `EFFECTIVE.DATE`, `ARRANGEMENT.ID` và `PROPERTY`.",
          "Bước 2: routine rẽ nhánh theo status `UNAUTH`, `DELETE`, `AUTH`, `REVERSE`.",
          "Bước 3: ở `UNAUTH`, `DELETE` và `REVERSE`, routine chỉ gọi `AA.Framework.UpdateChangeCondition()` để ghi nhận lần đổi condition kế tiếp.",
          "Bước 4: nhánh `AUTH` không tự update bảng nghiệp vụ nào; nếu có lỗi thì `HANDLE.ERROR` ghi lỗi qua `EB.SystemTables.setEtext(...)` và `EB.ErrorProcessing.StoreEndError()`."
        ],
        flow: [
          "Không tự write bảng business như bill hay account details.",
          "Handoff toàn bộ tracking thay đổi condition cho `AA.Framework.UpdateChangeCondition()`."
        ]
      },
      {
        name: "EVALUATE CHARGEOFF",
        routine: "AA.CHARGEOFF.EVALUATE.b",
        summary: "Quyết định tăng hay giảm charge-off từ `TXN.AMOUNT`, chọn rule theo trạng thái performing/suspended, rồi gọi các routine allocate chi tiết để cập nhật charge-off details và bill charge-off.",
        steps: [
          "Bước 1: `INITIALISE` lấy property record hiện tại từ `EB.SystemTables.getDynArrayFromRNew()`, sau đó `GET.CHARGEOFF.ORDER` đọc `FINANCIAL.STATUS` và `CHARGE.OFF.ORDER` để xác định thứ tự charge-off phải dùng.",
          "Bước 2: nếu record có định nghĩa `BOTH`, routine lấy ngay order ở nhánh đó; nếu không thì gọi `AA.Framework.GetSuspendDetails(ARRANGEMENT.ID, \"SUSPEND\", STATUS.DATE)` để tự suy ra `SUSPENDED` hay `PERFORMING`, rồi locate lại order tương ứng.",
          "Bước 3: `GET.CHARGEOFF.AMOUNT` đọc `ArrActTxnAmount` từ AAA. Dấu của amount quyết định đi nhánh tăng charge-off hay giảm charge-off.",
          "Bước 4: ở `PROCESS.INPUT.ACTION`, routine set `PROCESS.TYPE = \"UPDATE\"` rồi vào `CHARGEOFF.PROCESSING`; ở `DELETE`, set `PROCESS.TYPE = \"REVERSE\"` rồi chạy lại cùng flow để hoàn nguyên.",
          "Bước 5: trong flow allocate, các routine con như `AA.CHARGEOFF.ALLOCATE.PAYMENT.b` và `AA.CHARGEOFF.FULL.AMOUNT.ALLOCATE.b` đọc bill qua `AA.PaymentSchedule.GetBill/GetBillDetails(...)`, cập nhật số tiền charge-off từng property qua `AA.ChargeOff.UpdateChargeoffAmounts(...)`, đồng thời update `AA.ACTIVITY.BALANCES` cho special income hoặc bank portion."
        ],
        flow: [
          "Đọc AAA hiện tại, property record chargeoff và trạng thái suspend của arrangement.",
          "Nhánh full charge-off gọi `AA.ChargeOff.CreateChargeoffDetails(...)` rồi lặp bill `CHARGEOFF` để update reference và amount bằng `AA.ChargeOff.UpdateChargeoffAmounts(...)`.",
          "Nhánh allocate repayment dùng `AA.PayoutRules.UpdateBillPaymentAmounts(...)` và `AA.Framework.ProcessActivityBalances(...)` để đẩy phần còn lại vào accounting/special income."
        ]
      }
    ]
  },
  "change-product": {
    name: "CHANGE.PRODUCT",
    slug: "change-product",
    fields: [
      {
        name: "AA.CP.CHANGE.DATE.TYPE",
        slot: 1,
        details: [
          "Nguồn xác định ngày đổi sản phẩm: theo `PERIOD` hoặc nhập `DATE` trực tiếp.",
          "Field này chi phối cách routine tính renewal/change date trước khi ghi vào `AA.SCHEDULED.ACTIVITY`."
        ]
      },
      {
        name: "AA.CP.CHANGE.PERIOD",
        slot: 2,
        details: [
          "Kỳ tương đối dùng để tính ngày đổi sản phẩm khi `CHANGE.DATE.TYPE = PERIOD`.",
          "Routine validate và update dùng field này để suy ra ngày chạy tiếp theo thay vì giữ ngày cố định."
        ]
      },
      {
        name: "AA.CP.CHANGE.DATE",
        slot: 3,
        details: [
          "Ngày đổi sản phẩm cố định khi không dùng period.",
          "Field này là ngày mục tiêu được đẩy vào schedule nếu thay đổi sản phẩm được kích hoạt tự động."
        ]
      },
      {
        name: "AA.CP.CHANGE.ACTIVITY",
        slot: 4,
        details: [
          "Activity thực sự sẽ chạy khi đến ngày đổi sản phẩm, check sang `AA.ACTIVITY`.",
          "Source update dùng activity này để tạo hoặc xóa entry tương ứng trong `AA.SCHEDULED.ACTIVITY`."
        ]
      },
      {
        name: "AA.CP.PRIOR.DAYS",
        slot: 5,
        details: [
          "Số ngày chạy activity sớm hơn ngày đổi sản phẩm chính thức.",
          "Field này ảnh hưởng ngày schedule thực tế khi initiation type là auto."
        ]
      },
      {
        name: "AA.CP.CHG.TO.PRODUCT",
        slot: 6,
        details: [
          "Product đích mà arrangement sẽ chuyển sang.",
          "Trong `AA.CHANGE.PRODUCT.REMOVE.b`, source dùng product hiện tại và product đích để quyết định có phải xóa renewal activities cũ khỏi `AA.SCHEDULED.ACTIVITY` hay không."
        ]
      },
      {
        name: "AA.CP.ALLOWED.PRODUCT",
        slot: 7,
        details: [
          "Danh sách product được phép đổi sang.",
          "Đây là lớp kiểm soát nghiệp vụ ở điều kiện property, tách khỏi product đích thực tế `CHG.TO.PRODUCT`."
        ]
      },
      {
        name: "AA.CP.INITIATION.TYPE",
        slot: 10,
        details: [
          "Cách kích hoạt đổi sản phẩm: `AUTO` hoặc `MANUAL`.",
          "Source `REMOVE` dựa vào initiation type của AAA để chọn `MODE = DELETE` hay `MODE = CYCLE` khi dọn schedule cũ."
        ]
      },
      {
        name: "AA.CP.DEFAULT.ACTIVITY",
        slot: 11,
        details: [
          "Activity mặc định dùng khi không chỉ rõ `CHANGE.ACTIVITY` theo từng trường hợp.",
          "Field này là chốt fallback để build schedule đổi sản phẩm."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE CHANGE.PRODUCT",
        routine: "AA.CHANGE.PRODUCT.UPDATE.b",
        summary: "Action điều phối việc tạo, cycle hoặc xóa activity đổi sản phẩm; đồng thời đồng bộ `AA.SCHEDULED.ACTIVITY`, `AA.ACCOUNT.DETAILS`, `AA.ARRANGEMENT` và amortisation details.",
        steps: [
          "Bước 1: routine đọc AAA hiện tại, trạng thái activity, product hiện tại, product đích, initiation type và effective date.",
          "Bước 2: các nhánh input/delete/reverse quyết định `MODE` và `UPD.STATUS`, rồi gọi `UPDATE.CURRENT.ACTIVITY.DETAILS` để chuyển trạng thái product hiện tại trong `AA.ARRANGEMENT`.",
          "Bước 3: routine gọi `AA.Framework.SetScheduledActivity(...)` để thêm, cycle, amend hoặc delete activity change-product/renewal trong `AA.SCHEDULED.ACTIVITY`.",
          "Bước 4: `UPDATE.ACCOUNT.DETAILS` ghi lại renewal date hoặc xóa renewal date trong `AA.ACCOUNT.DETAILS` tùy nhánh xử lý.",
          "Bước 5: `UPDATE.AMORTISATION.DETAILS` cập nhật end date cho các charge amortisation chạy tới renewal/change date.",
          "Bước 6: trong các nhánh reversal/delete, routine còn dọn product details cũ khỏi `AA.ARRANGEMENT` để tránh để lại product status sai."
        ],
        flow: [
          "Ghi `AA.SCHEDULED.ACTIVITY` qua `AA.Framework.SetScheduledActivity(...)`.",
          "Ghi `AA.ACCOUNT.DETAILS` ở label `UPDATE.ACCOUNT.DETAILS`.",
          "Ghi `AA.ARRANGEMENT` qua flow `DO.ARRANGEMENT.UPDATE`/`AA.UPDATE.ARRANGEMENT` và cập nhật amortisation detail riêng."
        ]
      },
      {
        name: "REMOVE CHANGE.PRODUCT",
        routine: "AA.CHANGE.PRODUCT.REMOVE.b",
        summary: "Dọn schedule và product details khi product mới không còn mang property change product hoặc khi reverse/delete change product activity.",
        steps: [
          "Bước 1: routine đọc `ARRANGEMENT.ID`, `ACTIVITY.ID`, `ACTIVITY.DATE`, `ACTIVITY.STATUS`, product hiện tại từ `R.NEW`, `R.ARR.ACTIVITY` và `AA.ARRANGEMENT`.",
          "Bước 2: ở nhánh input, routine kiểm tra bundle compatibility qua `AA.ChangeProduct.ChangeProductBundleValidation(...)`; nếu fail thì set lỗi ngay trên field product của AAA.",
          "Bước 3: routine gọi `AA.Framework.GetScheduledActivityDate(...)` để lấy renewal activity tiếp theo, rồi xác định `MODE = DELETE` hoặc `MODE = CYCLE` tùy initiation type.",
          "Bước 4: xóa product detail cũ trong `AA.ARRANGEMENT`, cập nhật lại current/proceeded product status, rồi gọi `UPDATE.SCHEDULE.ACTIVITY` để xóa renewal activity không còn hợp lệ.",
          "Bước 5: clear renewal date trong `AA.ACCOUNT.DETAILS` và gọi `UPDATE.AMORTISATION.DETAILS` để đồng bộ charge amortisation.",
          "Bước 6: ở reversal/delete, routine đảo lại `UPD.STATUS`, khôi phục next scheduled activity và khôi phục renewal date nếu cần."
        ],
        flow: [
          "Đọc/ghi `AA.SCHEDULED.ACTIVITY` bằng `GetScheduledActivityDate(...)` và `UPDATE.SCHEDULE.ACTIVITY`.",
          "Đọc/ghi `AA.ARRANGEMENT` để đổi product status và remove product detail cũ.",
          "Đọc/ghi `AA.ACCOUNT.DETAILS` và amortisation details khi dọn renewal date."
        ]
      }
    ]
  },
  limit: {
    name: "LIMIT",
    slug: "limit",
    fields: [
      {
        name: "AA.LIM.LIMIT.REFERENCE",
        slot: 1,
        details: [
          "Khóa tham chiếu của limit ngoài bảng limit, ghép với `LIMIT.SERIAL` để ra limit id hoàn chỉnh.",
          "Trong `AA.LIMIT.UPDATE.b`, source ghép `REFERENCE.SERIAL` thành `OLD.LIMIT.REF`, `NEW.LIMIT.REF`, `NEW.LAST.LIMIT.REF` để gọi API thay đổi limit."
        ]
      },
      {
        name: "AA.LIM.LIMIT.SERIAL",
        slot: 2,
        details: [
          "Số serial của limit dưới cùng một reference; giá trị `NEW` báo hệ thống phải tạo limit mới.",
          "Trong `AA.LIMIT.CHANGE.b`, field này được kiểm tra trực tiếp để biết có phải tạo utilised limit record mới hay không."
        ]
      },
      {
        name: "AA.LIM.SINGLE.LIMIT",
        slot: 3,
        details: [
          "Cờ cho biết arrangement dùng một limit riêng hay có thể dùng chung với cấu trúc khác.",
          "Field này nằm ở lớp cấu hình limit core, tách khỏi mức amount hay tolerance."
        ]
      },
      {
        name: "AA.LIM.ALLOW.NETTING",
        slot: 4,
        details: [
          "Cho phép bù trừ giữa usage credit/debit trên cùng limit.",
          "Đây là thiết lập hành vi usage của limit, không phải số tiền thực cấp hạn mức."
        ]
      },
      {
        name: "AA.LIM.LIMIT.AMOUNT",
        slot: 5,
        details: [
          "Số hạn mức danh nghĩa của arrangement.",
          "Các action limit không trực tiếp ghi field này trong property record; thay vào đó chúng chuyển amount sang `AA.Limit.ProcessLimitChange(...)` để update limit engine."
        ]
      },
      {
        name: "AA.LIM.EXPIRY.DATE",
        slot: 6,
        details: [
          "Ngày hết hiệu lực của limit.",
          "Trong `AA.LIMIT.UPDATE.b`, routine còn tính lại `NEW.EXPIRY.DATE` và `OLD.EXPIRY.DATE` bằng `AA.Framework.DetermineTenorExpiryDate(...)` trước khi update limit thật."
        ]
      },
      {
        name: "AA.LIM.MANAGE.LIMIT",
        slot: 8,
        details: [
          "Cờ cho biết limit do AA tự quản lý hay do external/manual source quản lý.",
          "Trong `AA.LIMIT.UPDATE.b`, field này quyết định có gọi flow automatic utilised limit cho facility under deal hay không."
        ]
      },
      {
        name: "AA.LIM.OD.STATUS",
        slot: 12,
        details: [
          "Danh sách trạng thái overdraft được gắn theo customer hoặc arrangement.",
          "Field này đi cùng `OD.PERIOD`, `SUSPEND`, `NOTICE.FREQUENCY`, `POSTING.RESTRICT` để cấu hình vòng đời overdraft của limit."
        ]
      },
      {
        name: "AA.LIM.CREDIT.CHK.CONDITION",
        slot: 17,
        details: [
          "Cờ bật kiểm tra cover/credit condition trước khi cho phép dùng limit.",
          "Field này được thêm riêng cho control cover, tách khỏi logic limit amount thông thường."
        ]
      },
      {
        name: "AA.LIM.USE.SECONDARY.LIMIT",
        slot: 19,
        details: [
          "Cho phép fallback sang hạn mức phụ khi limit chính không đủ.",
          "Field đi cùng `SECONDARY.LIMIT.AMT` để kiểm soát mức cover thứ cấp."
        ]
      },
      {
        name: "AA.LIM.LIMIT",
        slot: 21,
        details: [
          "Limit key nội bộ của record limit thật.",
          "Trong `AA.LIMIT.UPDATE.b` và `AA.LIMIT.CHANGE.b`, routine đọc cả `OLD.LIMIT.KEY` và `NEW.LIMIT.KEY` để cập nhật đúng linked contracts và joint-owned limit."
        ]
      },
      {
        name: "AA.LIM.VALIDATION.LIMIT",
        slot: 28,
        details: [
          "Limit id riêng dùng cho bảng `ValidationLimitContracts`.",
          "Khi new arrangement ở level DEAL, `AA.LIMIT.UPDATE.b` gọi `LI.Config.LiUpdateLinkedContracts(...)` để add hoặc delete contract theo field này."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE LIMIT",
        routine: "AA.LIMIT.UPDATE.b",
        summary: "Đồng bộ thay đổi limit reference/key/expiry sang engine limit, utilised limit tự động và bảng linked validation contracts.",
        steps: [
          "Bước 1: routine dựng `OLD.LIMIT.REF`, `NEW.LIMIT.REF`, `NEW.LAST.LIMIT.REF` từ `LIMIT.REFERENCE` và `LIMIT.SERIAL` trong `R.OLD`, `R.NEW`, `R.NEWLAST`.",
          "Bước 2: gọi `AA.Framework.DetermineTenorExpiryDate(...)` để tính `NEW.EXPIRY.DATE` và `OLD.EXPIRY.DATE` theo effective date hiện tại.",
          "Bước 3: nếu là facility under deal và thiếu limit hoặc `MANAGE.LIMIT = YES`, routine chạy `AUTOMATIC.UTILISED.LIMIT.PROCESS` để dựng/utilise limit tự động.",
          "Bước 4: ở các nhánh `UNAUTH`, `DELETE`, `AUTH`, routine đều gọi `AA.Limit.ProcessLimitChange(...)` với full status activity, arrangement id, linked account, old/new limit refs, expiry dates và old/new limit keys.",
          "Bước 5: nếu arrangement mới có `VALIDATION.LIMIT` và group level là `DEAL`, routine gọi `LI.Config.LiUpdateLinkedContracts(...)` để add hoặc remove contract khỏi bảng linked contracts."
        ],
        flow: [
          "Không tự write trực tiếp record LIMIT trong file này; handoff việc thay đổi sang `AA.Limit.ProcessLimitChange(...)`.",
          "Có update `ValidationLimitContracts` qua `LI.Config.LiUpdateLinkedContracts(...)`.",
          "Có thể phát sinh flow tạo utilised limit tự động cho facility."
        ]
      },
      {
        name: "CHANGE LIMIT",
        routine: "AA.LIMIT.CHANGE.b",
        summary: "Xử lý đổi owner hoặc đổi limit binding trong amendment/change-customer flow, gồm cả tạo limit mới khi serial là `NEW` và kiểm tra limit record hiện hữu.",
        steps: [
          "Bước 1: routine đọc `TERM.AMOUNT` property liên kết, linked account, old/new limit key và limit serial hiện tại.",
          "Bước 2: nếu product line không phải `ACCOUNTS` hoặc external financial nhưng lại không đọc được limit record hiện có, routine raise lỗi để chặn việc tạo dummy limit record.",
          "Bước 3: nếu `LIMIT.SERIAL = NEW` hoặc không đọc được limit record cũ, routine set cờ `NEW.LIMIT = 1` để đi nhánh tạo mới.",
          "Bước 4: sau đó flow change-limit chuyển dữ liệu sang các API limit/customer liên quan để đổi binding giữa arrangement và limit khi customer hoặc owner thay đổi.",
          "Bước 5: reversal/delete của change-customer cũng chạy qua cùng cơ chế để đảo lại binding limit cũ."
        ],
        flow: [
          "Đọc limit record thực bằng `READ.LIMIT.RECORD`.",
          "Dựa vào linked account, product line và limit serial để chọn giữa update limit có sẵn hoặc tạo limit mới.",
          "Handoff cập nhật thực tế sang limit APIs của package `AA.Limit`/`LI.Config`."
        ]
      }
    ]
  },
  "payment-priority": {
    name: "PAYMENT.PRIORITY",
    slug: "payment-priority",
    fields: [
      {
        name: "AA.PAYPRTY.APPLICATION.TYPE",
        slot: 1,
        details: [
          "Loại payment rule sẽ dùng để ưu tiên phân bổ tiền trên facility/drawings.",
          "Trong `AA.PAYMENT.PRIORITY.ALLOCATE.b`, field này được lấy lại qua `AA.PaymentRules.GetFinancialAllocationRule(...)`, rồi map sang `PayRuleType`, `PayRuleApi`, `PayRulePymtMthd`, `PayRuleBillTyp`, `PayRuleBillStatus`."
        ]
      },
      {
        name: "AA.PAYPRTY.PRIORITY.RULE",
        slot: 5,
        details: [
          "Tên rule ưu tiên chính, check sang `AA.PAYMENT.PRIORITY.TYPE`.",
          "Routine allocate lặp toàn bộ list rule này, gọi `AA.PaymentPriority.GetPaymentPriorityType(...)` để lấy type, order, add-info và routine sort tương ứng."
        ]
      },
      {
        name: "AA.PAYPRTY.PRIORITY.RULE.LIST",
        slot: 6,
        details: [
          "Danh sách item con thuộc từng priority rule.",
          "Nó là input để `SortDrawingsByRules(...)` xác định thứ tự drawings/bills phải trả trước."
        ]
      },
      {
        name: "AA.PAYPRTY.REMAINDER.PAY.ACTIVITY",
        slot: 10,
        details: [
          "Activity dùng để xử lý phần tiền dư sau khi đã allocate hết các drawing/bill.",
          "Trong `ProcessRemainderActivity`, field này được chép vào `ArrActActivity` của AAA phụ rồi append bằng `AA.Framework.SecondaryActivityManager(...)`."
        ]
      },
      {
        name: "AA.PAYPRTY.ADVANCE.PAYMENT.METHOD",
        slot: 11,
        details: [
          "Cách xử lý advance payment: `PARTIAL` hoặc `FULL`.",
          "Field này chỉ áp khi payment rule type là `ADVANCE`; routine allocate dùng để chọn flow `ProcessAdvanceRepayment`."
        ]
      },
      {
        name: "AA.PAYPRTY.ADVANCE.PAYMENT.RESTRICTION",
        slot: 12,
        details: [
          "Ràng buộc bổ sung cho advance payment, tách khỏi phương pháp partial/full.",
          "Field này được giữ ở cùng property để validate các trường hợp advance repayment trước khi chạy allocate."
        ]
      }
    ],
    actions: [
      {
        name: "ALLOCATE PAYMENT.PRIORITY",
        routine: "AA.PAYMENT.PRIORITY.ALLOCATE.b",
        summary: "Sắp xếp drawings/bills theo priority rules, phân bổ repayment amount xuống từng drawing hoặc bill property, cập nhật bill payment amounts và tạo activity phụ cho phần dư.",
        steps: [
          "Bước 1: routine đọc property record hiện tại từ `R.NEW`, gọi `AA.PaymentRules.GetFinancialAllocationRule(...)` để lấy payment rule hiệu lực rồi gọi `AA.PaymentRules.GetPaymentRuleType(...)` để biết loại rule, payment method, bill type, bill status và API flag.",
          "Bước 2: `GetRepaymentAmount` đọc `ArrActTxnAmount`, `ArrActTxnAmountLcy`, `ArrActTxnExchRate` từ AAA; với `DELETE-REV` thì lấy `ArrActOrigTxnAmt`.",
          "Bước 3: nếu payment rule là API-based, routine handoff ngay sang `AA.PaymentPriority.ProcessApiRepayment(...)`; nếu là `ADVANCE` thì chạy `ProcessAdvanceRepayment(...)`.",
          "Bước 4: với flow thường, routine lấy toàn bộ drawings bằng `AA.PaymentPriority.GetDrawingsArrangementDetails(...)`; nếu rule là bill-based thì gọi tiếp `AA.PaymentPriority.GetDrawingsBillDetails(...)` để kéo `BillIds`, `BillDates`, `BillProperties`.",
          "Bước 5: `ProcessRules` gọi `AA.PaymentPriority.SortDrawingsByRules(...)` để sắp thứ tự, sau đó `GetPropertyDueAmount(...)` lấy due amount theo property/balance type và `AllocateDrawingsRepaymentAmount(...)` tính `BillPropertyRepayAmount`, `RemainderAmount`, `BillRepayDates`.",
          "Bước 6: routine lặp từng drawing, build `TransRuleDefn`, gọi `AA.Framework.ProcessActivityBalances(...)` và `AA.Framework.UpdateActivityBalances(...)` để ghi `AA.ACTIVITY.BALANCES`, rồi gọi `AA.PaymentPriority.ApplyPaymentPriority(...)` để áp payment trên drawing đó.",
          "Bước 7: nếu còn `RemainderAmount`, routine dựng AAA phụ với amount, amount lcy, exch rate và append qua `AA.Framework.SecondaryActivityManager(...)`.",
          "Bước 8: ở nhánh delete/reverse, routine lấy các bill đã repay qua `AA.PaymentSchedule.GetBill(...)`, đọc actual repayment date từ `AA.ACCOUNT.DETAILS`, rồi gọi `AA.PayoutRules.UpdateBillPaymentAmounts(..., \"REVERSE\", ...)` để hoàn lại bill payment amounts."
        ],
        flow: [
          "Đọc drawings, bills và property due amounts qua package `AA.PaymentPriority`/`AA.PaymentSchedule`.",
          "Ghi `AA.ACTIVITY.BALANCES` qua `AA.Framework.ProcessActivityBalances(...)` và `AA.Framework.UpdateActivityBalances(...)`.",
          "Ghi bill payment amounts qua `AA.PayoutRules.UpdateBillPaymentAmounts(...)`.",
          "Tạo secondary activity cho remainder qua `AA.Framework.SecondaryActivityManager(...)`."
        ]
      },
      {
        name: "UPDATE PAYMENT.PRIORITY",
        routine: "AA.PAYMENT.PRIORITY.UPDATE.b",
        summary: "Wrapper change-condition cho property payment priority.",
        steps: [
          "Bước 1: routine đọc context AAA gồm status, activity id, effective date, arrangement id và property id.",
          "Bước 2: nhánh `UNAUTH`, `DELETE` và `REVERSE` đều gọi `AA.Framework.UpdateChangeCondition()`.",
          "Bước 3: nhánh `AUTH` không tự ghi file nghiệp vụ nào."
        ],
        flow: [
          "Không tự cập nhật bill hay activity balances.",
          "Chỉ track condition change qua `AA.Framework.UpdateChangeCondition()`."
        ]
      }
    ]
  },
  "product-bundle": {
    name: "PRODUCT.BUNDLE",
    slug: "product-bundle",
    fields: [
      {
        name: "AA.BUN.BUNDLE.CONSTITUTION",
        slot: 1,
        details: [
          "Kiểu hình thành bundle, ví dụ rỗng hoặc `RULE.BASED`.",
          "Field này tách bundle tạo thủ công khỏi bundle sinh theo rule."
        ]
      },
      {
        name: "AA.BUN.PRODUCT.GROUP",
        slot: 2,
        details: [
          "Nhóm product được phép nằm trong bundle.",
          "Field là lớp lọc đầu tiên trước `PRODUCT` và `ARRANGEMENT` khi validate hoặc update link bundle."
        ]
      },
      {
        name: "AA.BUN.PRODUCT",
        slot: 4,
        details: [
          "Product cụ thể thuộc từng product group trong bundle.",
          "Trong update/close, source lặp theo product group rồi tới danh sách arrangement của từng product."
        ]
      },
      {
        name: "AA.BUN.MINIMUM",
        slot: 5,
        details: [
          "Số arrangement tối thiểu phải có trong từng nhóm bundle.",
          "Field này là điều kiện cấu trúc bundle, không phải amount hay limit."
        ]
      },
      {
        name: "AA.BUN.MAXIMUM",
        slot: 6,
        details: [
          "Số arrangement tối đa được phép gắn dưới từng nhóm bundle.",
          "Nó đi cặp với `MINIMUM` để khống chế số participant trong bundle."
        ]
      },
      {
        name: "AA.BUN.ARRANGEMENT",
        slot: 7,
        details: [
          "Danh sách arrangement participant thực sự của bundle.",
          "Trong `AA.PRODUCT.BUNDLE.CLOSE.b`, source lặp field này theo `@SM`, lock từng arrangement, chèn hoặc xóa `ArrLinkDate/Type/Arrangement/Property` rồi `ArrangementWrite(...)`."
        ]
      },
      {
        name: "AA.BUN.ARR.CURRENCY",
        slot: 8,
        details: [
          "Currency áp cho từng participant arrangement trong bundle.",
          "Field này đi cùng participant arrangement để kiểm soát pool/bundle đa tiền tệ."
        ]
      },
      {
        name: "AA.BUN.ARR.INFO.ONLY",
        slot: 12,
        details: [
          "Cờ đánh dấu participant chỉ để tham chiếu, không tham gia xử lý chính.",
          "Trong `AA.PROPERTY.CONTROL.UPDATE.b`, arrangement có cờ này sẽ bị bỏ qua khi quyết định có bắn `APPLY.PC.CHANGE` hay không."
        ]
      },
      {
        name: "AA.BUN.MASTER.ARRANGEMENT",
        slot: 15,
        details: [
          "Arrangement master của bundle.",
          "Field này xác định arrangement đóng vai trò parent/master khi update link hoặc pricing/pool live date."
        ]
      },
      {
        name: "AA.BUN.MASTER.TYPE",
        slot: 16,
        details: [
          "Property master của bundle, check sang `AA.PROPERTY`.",
          "Trong `AA.PRODUCT.BUNDLE.CHECK.LINKS.b`, routine còn dùng `MASTER.TYPE` để xác định property class master có phải `INTEREST.COMPENSATION` hay không."
        ]
      },
      {
        name: "AA.BUN.PARTICIPANT.OWNER",
        slot: 19,
        details: [
          "Ràng buộc owner của participant: `BUNDLE.OWNER` hoặc `ANY`.",
          "Field này dùng để lọc arrangement được phép gia nhập bundle theo vai trò sở hữu."
        ]
      },
      {
        name: "AA.BUN.REFERENCE.CCY",
        slot: 21,
        details: [
          "Tiền tệ tham chiếu chung của bundle/pool.",
          "Field này là chuẩn đối chiếu cho các participant currency và master live date processing."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE PRODUCT.BUNDLE",
        routine: "AA.PRODUCT.BUNDLE.UPDATE.b",
        summary: "Đồng bộ link bundle giữa arrangement bundle và các donor/recipient arrangements qua API update bundle link; xử lý input, auth, delete, reverse trên cùng một flow.",
        steps: [
          "Bước 1: routine đọc `ACTIVITY.STATUS`, `EFFECTIVE.DATE`, `ARRANGEMENT.ID`, property class, property id, arrangement status, activity hiện tại và initiation type.",
          "Bước 2: ở nhánh input, lấy property record mới từ `R.NEW` và record cũ từ `R.OLD`; nếu là `NEW.OFFER` đi live bằng `SCHEDULED*SOD` thì source xóa `OLD.PROP.REC` để buộc update lại link.",
          "Bước 3: gọi `AA.ProductBundle.UpdateArrangementBundleLink(ARRANGEMENT.ID, ACTIVITY.STATUS, R.PRODUCT.BUNDLE, OLD.PROP.REC, ARR.ACTIVITY, RET.ERROR)` để cập nhật cả bundle arrangement lẫn donor/recipient arrangements.",
          "Bước 4: ở `DELETE`, `AUTH`, `REVERSE`, routine dùng `AA.Framework.GetPreviousPropertyRecord(...)` để lấy record bundle trước đó rồi gọi lại cùng API với status tương ứng.",
          "Bước 5: flow authorise/delete không tự write từng bảng ngay trong routine này; việc ghi thật sang `AA.ARRANGEMENT` và `AC.BLOCK.CLOSURE` nằm trong API bundle link."
        ],
        flow: [
          "Đọc `R.NEW`, `R.OLD`, `AA.ARRANGEMENT` và previous property record.",
          "Handoff update thật sang `AA.ProductBundle.UpdateArrangementBundleLink(...)`.",
          "Nhánh auth còn liên quan tới `AC.BLOCK.CLOSURE` theo comment và API bundle-link."
        ]
      },
      {
        name: "CHECK.LINKS PRODUCT.BUNDLE",
        routine: "AA.PRODUCT.BUNDLE.CHECK.LINKS.b",
        summary: "Quyết định bundle link phải xử lý online hay đẩy offline, dựa trên product-level `PROPERTY.CONTROL`, `BUNDLE.HIERARCHY`, activity class và master property type.",
        steps: [
          "Bước 1: routine nhận `ProductId`, `EffectiveDate`, `ActivityClassId`, `ProductBundleRec`; nếu đang chạy simulation service thì set `ReturnFlag = 1` ngay.",
          "Bước 2: lấy `MASTER.TYPE` từ product bundle record, gọi `AA.ProductFramework.GetPropertyClass(...)`; nếu master type không thuộc class `INTEREST.COMPENSATION` thì set xử lý online.",
          "Bước 3: đọc product record bằng `AA.ProductFramework.GetProductPropertyRecord(\"PRODUCT\", ...)`, rồi tìm property record `PROPERTY.CONTROL` và `BUNDLE.HIERARCHY` ở level product.",
          "Bước 4: với từng property record tìm được, routine ghép các field trọng yếu vào `ArrayValue` và gọi `AA.Framework.DetermineNullArray(...)`; chỉ cần có field nào thực sự có giá trị là set `ReturnFlag = 1`.",
          "Bước 5: cuối cùng, nếu activity class hiện tại không phải `UPDATE-PRODUCT.BUNDLE`, `UPDATE-INTEREST.COMPENSATION`, `RENEGOTIATE-ARRANGEMENT` hoặc `NEW-ARRANGEMENT`, routine cũng ép `ReturnFlag = 1`."
        ],
        flow: [
          "Đọc product-level `PROPERTY.CONTROL` và `BUNDLE.HIERARCHY`.",
          "Không write record; chỉ trả cờ cho caller quyết định online/offline processing."
        ]
      },
      {
        name: "CLOSE PRODUCT.BUNDLE",
        routine: "AA.PRODUCT.BUNDLE.CLOSE.b",
        summary: "Gắn hoặc gỡ `LINK.DATE` giữa bundle arrangement và các participant arrangements khi bundle bị đóng hoặc hoàn nguyên; đồng thời dọn `AC.BLOCK.CLOSURE` ở nhánh auth.",
        steps: [
          "Bước 1: routine đọc `ACTIVITY.STATUS`, `EFFECTIVE.DATE`, `ARRANGEMENT.ID` và property bundle hiện tại.",
          "Bước 2: ở nhánh input, source lặp tất cả participant arrangements trong field `BunArrangement`, lock từng `AA.ARRANGEMENT`, chèn thêm `ArrLinkDate`, `ArrLinkType`, `ArrLinkArrangement`, `ArrLinkProperty`, `ArrArrangementType`, rồi `AA.Framework.ArrangementWrite(...)`.",
          "Bước 3: sau khi update từng participant, `PERFORM.BUNDLE.UPDATES` chèn đúng bộ link fields tương tự vào record `AA.ARRANGEMENT` của chính bundle arrangement rồi write lại.",
          "Bước 4: ở nhánh delete/reverse, routine locate `EFFECTIVE.DATE` trong các field link và `DEL` toàn bộ bộ link tương ứng trên participant cũng như bundle arrangement, rồi write lại record.",
          "Bước 5: ở nhánh `AUTH`/`AUTH-REV`, source đi vào `UPDATE.AC.BLOCK.CLOSURE` để dọn block closure liên quan cho linked arrangements."
        ],
        flow: [
          "Đọc và ghi trực tiếp `AA.ARRANGEMENT` của participants và bundle arrangement qua `ArrangementLock`/`ArrangementWrite`.",
          "Nhánh auth xử lý thêm `AC.BLOCK.CLOSURE`."
        ]
      },
      {
        name: "UPDATE.LIVE.DATE PRODUCT.BUNDLE",
        routine: "AA.PRODUCT.BUNDLE.UPDATE.LIVE.DATE.b",
        summary: "Gom `MASTER.LIVE.DATE` và các participant `LIVE.DATE`, loại trùng rồi ghi danh sách pool administration theo từng live date.",
        steps: [
          "Bước 1: routine đọc `R.NEW` để lấy `MasterLiveDate`, `CTLiveDate`, `CTArrangement`.",
          "Bước 2: chỉ ở nhánh `AUTH`, source ghép `MasterLiveDate` và danh sách participant live dates vào `LiveDateList`, convert marker và loại trùng bằng `AA.Framework.RemoveDuplicateValues(...)`.",
          "Bước 3: lặp từng `LiveDate` còn lại và gọi `AB.Framework.UpdatePoolAdministrationList(BundleId, LiveDate, \"\", \"UPDATE\", \"\", RetError)`."
        ],
        flow: [
          "Không ghi `AA.ARRANGEMENT` trong routine này.",
          "Ghi list file pool administration qua `AB.Framework.UpdatePoolAdministrationList(...)`."
        ]
      }
    ]
  },
  "property-control": {
    name: "PROPERTY.CONTROL",
    slug: "property-control",
    fields: [
      {
        name: "AA.PCON.PRODUCT.GROUP",
        slot: 1,
        details: [
          "Nhóm product mà property control sẽ áp vào trong bundle.",
          "Nếu không có `PRODUCT` cụ thể, `AA.PROPERTY.CONTROL.UPDATE.b` dùng field này để đối chiếu product group của từng arrangement trong bundle."
        ]
      },
      {
        name: "AA.PCON.PRODUCT",
        slot: 2,
        details: [
          "Product cụ thể được áp property control.",
          "Trong `ProcessList`, source locate product id của từng arrangement bundle trong field này trước khi xét các điều kiện khác."
        ]
      },
      {
        name: "AA.PCON.PROPERTY.CLASS",
        slot: 3,
        details: [
          "Property class bị điều khiển khi bundle thay đổi.",
          "Field này là một trong các điều kiện bắt buộc để routine quyết định có bắn `APPLY.PC.CHANGE` cho arrangement con hay không."
        ]
      },
      {
        name: "AA.PCON.PROPERTY",
        slot: 4,
        details: [
          "Property cụ thể trong property class bị điều khiển.",
          "Nếu field này trống nhưng `PROPERTY.CLASS` có giá trị, routine vẫn có thể trigger change theo class-level."
        ]
      },
      {
        name: "AA.PCON.CURRENCY",
        slot: 5,
        details: [
          "Currency điều kiện cho property control.",
          "Field này đi cùng product/property để giới hạn control theo đồng tiền arrangement."
        ]
      },
      {
        name: "AA.PCON.PROPERTY.CONDITION",
        slot: 6,
        details: [
          "Tên condition/property condition sẽ bị áp lại hoặc dỡ bỏ.",
          "Field này giữ định danh condition, còn việc bắn activity dùng `APPLY.PC.CHANGE` nằm ở action update."
        ]
      },
      {
        name: "AA.PCON.CONTROL.MASTER",
        slot: 7,
        details: [
          "Cách xử lý với master arrangement: `SUPPRESS`, `REPLACE` hoặc `MERGE`.",
          "Trong `CheckListUpdate`, nếu arrangement hiện tại là master thì chỉ khi field này có giá trị routine mới set `ListUpdateFlag = 1`."
        ]
      },
      {
        name: "AA.PCON.CONTROL.SECONDARY",
        slot: 8,
        details: [
          "Cách xử lý với secondary/donor arrangement: `SUPPRESS`, `REPLACE` hoặc `MERGE`.",
          "Nếu arrangement không nằm trong danh sách master, source kiểm tra field này để quyết định có bắn `APPLY.PC.CHANGE` hay không."
        ]
      },
      {
        name: "AA.PCON.SOURCE.PRODUCT",
        slot: 13,
        details: [
          "Product nguồn đã sinh ra property control record; field là `NOINPUT`.",
          "Nó được giữ làm trace back source product thay vì cho người dùng sửa tay."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE PROPERTY.CONTROL",
        routine: "AA.PROPERTY.CONTROL.UPDATE.b",
        summary: "Khi property control trên bundle thay đổi, routine tìm các arrangement trong `PRODUCT.BUNDLE` bị ảnh hưởng rồi cập nhật danh sách external activities `APPLY.PC.CHANGE`.",
        steps: [
          "Bước 1: routine đọc `BundleArrangementId`, `EffectiveDate`, full activity status; chỉ nhánh `AUTH` và `AUTH-REV` có logic chính.",
          "Bước 2: ở `PerformAuthoriseAction`, routine lấy property control record từ `R.NEW`, rồi gọi `AA.ProductFramework.GetPropertyRecord(..., \"PRODUCT.BUNDLE\", ...)` để lấy record bundle của arrangement hiện tại.",
          "Bước 3: từ bundle record, routine lấy danh sách participant arrangements và cờ `ArrInfoOnly`; arrangement nào có `YES` sẽ bị bỏ qua hoàn toàn.",
          "Bước 4: `getPreviousPropertyRecord` lấy bundle record trước đó bằng `AA.Framework.GetPreviousPropertyRecord(...)`, ghép thêm info-flag vào list arrangement rồi dùng `AA.Framework.DetermineChangeValues(...)` để xác định arrangement nào vừa link/delink hoặc đổi info-flag.",
          "Bước 5: với từng arrangement thay đổi, `ProcessList` gọi `AA.Framework.GetArrangementProduct(...)`, đối chiếu product/product group/property/property class với các field trong property control; nếu match hoặc arrangement đã từng có `ArrPropertyControlPropDate`, routine set `ListUpdateFlag`.",
          "Bước 6: `UpdateProcessActivitiesList` dựng activity name dạng `PRODUCTLINE-APPLY.PC.CHANGE-ARRANGEMENT` rồi gọi `AA.Framework.ManageExternalActivities(CurArrId, ProcessType, EffectiveDate, ActivityName, ...)` để ghi vào process activities list."
        ],
        flow: [
          "Đọc `PRODUCT.BUNDLE` hiện tại và previous property record của bundle.",
          "Đọc product/product group từng arrangement con bằng `AA.Framework.GetArrangementProduct(...)`.",
          "Ghi danh sách external activities qua `AA.Framework.ManageExternalActivities(...)`."
        ]
      }
    ]
  },
  "pricing-rules": {
    name: "PRICING.RULES",
    slug: "pricing-rules",
    fields: [
      {
        name: "AA.PRICE.PLAN.SELECT.METHOD",
        slot: 1,
        details: [
          "Cách chọn pricing plan: `AUTOMATIC`, `MANUAL`, `AUTOMATIC.OR.MANUAL` hoặc `NO.PRICING`.",
          "Trong `AA.PRICING.RULES.UPDATE.b`, nếu new arrangement mà pricing selection không phải `AUTOMATIC` thì routine không schedule plan reset, chỉ trigger after-assessment activity phụ."
        ]
      },
      {
        name: "AA.PRICE.PLAN.SELECT.TYPE",
        slot: 2,
        details: [
          "Kiểu chọn plan khi hệ thống tự chọn, hiện source field cho option `BEST`.",
          "Nó quyết định engine sẽ lấy plan tốt nhất hay không."
        ]
      },
      {
        name: "AA.PRICE.PLAN.SELECT.PROPERTY",
        slot: 3,
        details: [
          "Property dùng làm tiêu chí chọn pricing plan tự động.",
          "Field này trỏ sang `AA.PROPERTY`, không phải benefit hay pricing program."
        ]
      },
      {
        name: "AA.PRICE.PLAN.RESET.FREQ",
        slot: 4,
        details: [
          "Tần suất reset plan pricing.",
          "Trong action update, source lấy field này rồi gọi `AA.Rules.GetRecalcDate(...)` để tính `NEXT.CYCLED.DATE` cho `PLAN.RESET`."
        ]
      },
      {
        name: "AA.PRICE.PLAN.RESET.ON.ACT",
        slot: 5,
        details: [
          "Danh sách activity có thể buộc reset pricing plan.",
          "Field này bổ sung cho reset theo kỳ, giúp pricing reset khi có event nghiệp vụ."
        ]
      },
      {
        name: "AA.PRICE.PROGRAM.LIMIT",
        slot: 6,
        details: [
          "Giới hạn số pricing program có thể chọn hoặc áp đồng thời.",
          "Field này là ràng buộc cấu hình, không phải frequency."
        ]
      },
      {
        name: "AA.PRICE.SELECTED.PROGRAM",
        slot: 7,
        details: [
          "Pricing program được chọn thủ công hoặc đã được engine chọn ra.",
          "Field này tách phần chọn program khỏi phần định nghĩa rule/benefit."
        ]
      },
      {
        name: "AA.PRICE.PRICING.PROGRAM",
        slot: 8,
        details: [
          "Tên pricing program sẽ được đánh giá trong rule.",
          "Nó là parent của `RULE.NAME`, `PERIODIC.ATTRIBUTE`, `RULE.SOURCE`, `RULE.VALUE`."
        ]
      },
      {
        name: "AA.PRICE.RULE.SOURCE",
        slot: 12,
        details: [
          "Nguồn dữ liệu dùng để đánh giá rule pricing.",
          "Field này là đầu vào cho engine rule evaluation khi xác định pricing benefit."
        ]
      },
      {
        name: "AA.PRICE.RULE.VALUE",
        slot: 13,
        details: [
          "Giá trị so sánh hoặc giá trị tham chiếu của rule pricing.",
          "Nó là vế dữ liệu đi cùng `RULE.SOURCE` và `RULE.NAME`."
        ]
      },
      {
        name: "AA.PRICE.PRICING.BENEFIT",
        slot: 19,
        details: [
          "Benefit sẽ được áp nếu rule pricing đạt điều kiện.",
          "Field này gắn trực tiếp với `PRICING.PROPERTY`, `TRIGGER`, `EVALUATION.RESULT`."
        ]
      },
      {
        name: "AA.PRICE.PRICING.PROPERTY",
        slot: 20,
        details: [
          "Property chịu tác động của pricing benefit.",
          "Trong `CHECK.PRICING.PROPERTY`, source so sánh field này giữa `R.NEW` và `R.OLD`; property nào bị gỡ ra sẽ sinh `CLEAR.ASSESSMENT` activity phụ."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE PRICING.RULES",
        routine: "AA.PRICING.RULES.UPDATE.b",
        summary: "Tính ngày reset plan tiếp theo, cập nhật `AA.SCHEDULED.ACTIVITY` cho `PLAN.RESET`, và tạo secondary activities `POST.ASSESSMENT` hoặc `CLEAR.ASSESSMENT` khi pricing property thay đổi.",
        steps: [
          "Bước 1: routine đọc status AAA, full status, arrangement id, property id và cờ new arrangement.",
          "Bước 2: nếu là new arrangement mà pricing selection không phải `AUTOMATIC`, routine không schedule plan reset; nếu status là `UNAUTH` thì chỉ trigger after-assessment activity phụ.",
          "Bước 3: ở `PROCESS.INPUT.ACTION`, source lấy `PLAN.RESET.FREQ` từ `R.NEW`, rồi đọc property `ACCOUNT` bằng `AA.ProductFramework.GetPropertyRecord(...)` để lấy `DATE.CONVENTION`, `DATE.ADJUSTMENT`, `BUS.DAYS`.",
          "Bước 4: gọi `AA.Rules.GetRecalcDate(...)` để tính `NEXT.CYCLED.DATE`, sau đó `AA.Framework.SetScheduledActivity(ARRANGEMENT.ID, RESET.ACTIVITY, NEXT.CYCLED.DATE, MODE, RET.ERROR)` để cycle `PLAN.RESET` trong `AA.SCHEDULED.ACTIVITY`.",
          "Bước 5: `CHECK.PRICING.PROPERTY` so sánh `PricePricingProperty` giữa `R.NEW` và `R.OLD`; property nào bị bỏ đi sẽ được gom vào `AssessProperty`.",
          "Bước 6: `UPDATE.SECONDARY.LIST` dựng AAA phụ `PRODUCTLINE-CLEAR.ASSESSMENT-PROPERTY`, gắn context `ASSESSMENT.PROPERTY:n` cho từng property bị bỏ, rồi append qua `AA.Framework.SecondaryActivityManager(...)`.",
          "Bước 7: `TriggerAfterAssessment` cũng dựng AAA phụ `POST.ASSESSMENT` cho new arrangement khi cần."
        ],
        flow: [
          "Đọc property `ACCOUNT` để lấy date convention cho recalc date.",
          "Ghi `AA.SCHEDULED.ACTIVITY` qua `AA.Framework.SetScheduledActivity(...)`.",
          "Ghi secondary activity list qua `AA.Framework.SecondaryActivityManager(...)`."
        ]
      },
      {
        name: "REMOVE PRICING.RULES",
        routine: "AA.PRICING.RULES.REMOVE.b",
        summary: "Dọn hoặc khôi phục activity `PLAN.RESET` khi property pricing rules bị bỏ khỏi product/change product flow.",
        steps: [
          "Bước 1: routine đọc `ArrangementId`, `ActivityId`, `ActivityDate`, `ActivityStatus`.",
          "Bước 2: ở input, routine dựng `PlanResetActivity`, gọi `AA.Framework.GetScheduledActivityDate(...)` để lấy ngày `PLAN.RESET` tiếp theo, rồi `AA.Framework.SetScheduledActivity(..., \"DELETE\", ...)` để xóa schedule này.",
          "Bước 3: ở reverse/delete, routine đọc lại property pricing rules cũ bằng `AA.ProductFramework.GetPropertyRecord(...)`, lấy `PlanResetFreq` cũ rồi `AA.Framework.SetScheduledActivity(..., \"AMEND\", ...)` để khôi phục schedule."
        ],
        flow: [
          "Chỉ đụng `AA.SCHEDULED.ACTIVITY`.",
          "Không tự cập nhật pricing benefit/property records trong routine này."
        ]
      }
    ]
  },
  "pricing-grid": {
    name: "PRICING.GRID",
    slug: "pricing-grid",
    fields: [
      {
        name: "AA.GRID.CRITERION.ID",
        slot: 1,
        details: [
          "Data element id dùng làm tiêu chí tra grid, đọc từ bảng `AA.DATA.ELEMENTS`.",
          "Trong `AA.PRICING.GRID.UPDATE.b`, routine đọc từng id này bằng `AA.Framework.DataElements.Read(...)` để biết criterion nào là loại `PROPERTY`."
        ]
      },
      {
        name: "AA.GRID.TARGET.ID",
        slot: 2,
        details: [
          "Target element nhận kết quả grid, đọc từ `AA.TARGET.ELEMENTS`.",
          "Field này là đích mapping của pricing grid sau khi criterion match."
        ]
      },
      {
        name: "AA.GRID.DEFAULT",
        slot: 3,
        details: [
          "Giá trị mặc định dùng khi không match criterion nào trong grid.",
          "Đây là mức fallback của grid, không phụ thuộc tier type."
        ]
      },
      {
        name: "AA.GRID.TIER.TYPE",
        slot: 7,
        details: [
          "Cách hiểu grid target: `SINGLE`, `LEVEL` hoặc `BAND`.",
          "Field này quyết định engine grid diễn giải `TARGET.1..10` theo kiểu bậc hay dải."
        ]
      },
      {
        name: "AA.GRID.CRITERION.1",
        slot: 8,
        details: [
          "Danh sách giá trị criterion ứng với `CRITERION.ID` thứ nhất.",
          "Nếu data element của criterion là type `PROPERTY`, action update sẽ tách các giá trị này thành danh sách property duy nhất để ghi reference details."
        ]
      },
      {
        name: "AA.GRID.CRITERION.2",
        slot: 9,
        details: [
          "Giá trị criterion thứ hai cho grid.",
          "Source update gom toàn bộ `CRITERION.1..10` để dựng old/new source-target property links."
        ]
      },
      {
        name: "AA.GRID.TARGET.1",
        slot: 18,
        details: [
          "Giá trị target của bậc hoặc band đầu tiên trong grid.",
          "Các `TARGET.n` là output amount/value ứng với từng tổ hợp criterion."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE PRICING.GRID",
        routine: "AA.PRICING.GRID.UPDATE.b",
        summary: "Trích các criterion kiểu property, ghi reference details cho grid theo property effective date, rồi cập nhật arrangement/customer grid links giữa old và new mapping.",
        steps: [
          "Bước 1: routine đọc `ActivityStatus`, `ActivityFullStatus`, `ArrActivityId`, `EffectiveDate`, `PropertyEffDate`, `ArrangementId`, `PropertyId`, `MasterArrangementId`.",
          "Bước 2: `INITIALISE` lấy toàn bộ `GridCriterionId` và `GridCriterion1..10` từ `R.NEW`.",
          "Bước 3: ở `ProcessInputAction`, routine lặp từng `CriterionId`, đọc data element bằng `AA.Framework.DataElements.Read(...)`; nếu `AaDataElementsType = PROPERTY` thì tách list property từ criterion values, loại trùng và gom vào `Final.Property.List` cùng `Final.Property.Id`.",
          "Bước 4: routine dựng `RPricingGrid` với `<1> = PropertyEffDate`, `<2> = Final.Property.Id`, `<3> = Final.Property.List`, rồi gọi `AA.Framework.UpdateReferenceDetails(ArrangementId, \"VAL\", \"PRICING.GRID\", ArrActivityId, RPricingGrid, ReturnError)`.",
          "Bước 5: ở delete/reverse, source gọi lại `UpdateReferenceDetails(...)` với `ProcessType = DELETE` hoặc `REVERSE` để xóa/hoàn nguyên reference details.",
          "Bước 6: `UpdateLinkAndReferenceDetails` đọc cả old criterion ids/values và new criterion ids/values, gọi `AA.PricingGrid.GetSourceAndTargetProperty(...)` cho từng phía để suy ra source property, target property, grid property id và level.",
          "Bước 7: nếu mapping cũ và mới khác nhau, `UpdateArrangementLink` gọi `AA.PricingGrid.UpdateArrangementGridLink(...)` trước với `REMOVE` cho toàn bộ old links, rồi với `ADD` cho toàn bộ new links; source còn kiểm tra `UsePricingGridFlag` từ property interest ở nhánh delete/reverse.",
          "Bước 8: nếu `level = 1`, `UpdateCustomerLink` còn gọi `AA.PricingGrid.UpdateCustomerGridLink(...)` để add/delete customer-level grid link."
        ],
        flow: [
          "Đọc data elements và old/new criterion values.",
          "Ghi reference details qua `AA.Framework.UpdateReferenceDetails(...)`.",
          "Ghi arrangement grid links qua `AA.PricingGrid.UpdateArrangementGridLink(...)`.",
          "Ghi customer grid links qua `AA.PricingGrid.UpdateCustomerGridLink(...)`."
        ]
      }
    ]
  }
};
