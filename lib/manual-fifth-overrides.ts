import type { PropertyClass } from "@/lib/property-data";

export const manualFifthOverrides: Record<string, PropertyClass> = {
  constraint: {
    name: "CONSTRAINT",
    slug: "constraint",
    fields: [
      {
        name: "AA.CONS.TYPE",
        slot: 5,
        details: [
          "Loại mốc hoặc chu kỳ bị ràng buộc, như `INTEREST.PERIOD`, `STATEMENT.PERIOD`, `RENEWAL_PERIOD`, `FINANCIAL.YEAR`, `DATE`.",
          "Đây là trục chính để engine biết constraint đang kiểm soát kiểu lịch nào."
        ]
      },
      {
        name: "AA.CONS.DETAIL",
        slot: 6,
        details: [
          "Thông tin chi tiết đi kèm loại constraint đã chọn.",
          "Field này là phần bổ sung để rule biết ràng buộc cụ thể áp vào đối tượng nào."
        ]
      },
      {
        name: "AA.CONS.PERIOD",
        slot: 7,
        details: [
          "Chu kỳ hoặc khoảng thời gian dùng để tính constraint.",
          "Source định nghĩa field này đi cùng `TYPE` để engine so khớp ngày và kỳ xử lý."
        ]
      },
      {
        name: "AA.CONS.RESULT",
        slot: 8,
        details: [
          "Kết quả khi vi phạm constraint: `ERROR` hoặc `OVERRIDE`.",
          "Field này quyết định flow sẽ chặn cứng hay chỉ sinh override."
        ]
      },
      {
        name: "AA.CONS.ERROR.MESSAGE",
        slot: 9,
        details: [
          "Mã lỗi trong `EB.ERROR` dùng khi `RESULT = ERROR`.",
          "Engine sẽ lấy chính message code này để raise end error."
        ]
      },
      {
        name: "AA.CONS.OVERRIDE.MESSAGE",
        slot: 10,
        details: [
          "Mã override trong `OVERRIDE` dùng khi `RESULT = OVERRIDE`.",
          "Giúp gắn đúng override text thay vì hard-code thông báo."
        ]
      },
      {
        name: "AA.CONS.INITIAL.DATE",
        slot: 11,
        details: [
          "Ngày gốc để bắt đầu tính constraint.",
          "Field này là điểm neo đầu tiên trước khi áp period/type."
        ]
      },
      {
        name: "AA.CONS.ACTIVITY.FUNCTION",
        slot: 12,
        details: [
          "Giới hạn function của activity mà constraint được áp vào, source chỉ định `INPUT` hoặc `REVERSE`.",
          "Nhờ đó cùng một constraint có thể chỉ chạy ở chiều nhập hoặc chiều đảo."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE CONSTRAINT",
        routine: "AA.CONSTRAINT.UPDATE.b",
        summary: "Routine này mới là khung điều phối status và error handling; hiện source chưa tự update bảng business nào.",
        steps: [
          "Bước 1: đọc `R.ACTIVITY.STATUS`, `R.ACTIVITY.FULL.STATUS`, `ARR.ACTIVITY.ID`, `ACTIVITY.ACTION`, `EFFECTIVE.DATE`, `ARRANGEMENT.ID`, rồi khởi tạo `PROPERTY` từ common.",
          "Bước 2: tách nhánh theo status `UNAUTH`, `DELETE-REV`, `DELETE`, `AUTH`, `REVERSE`.",
          "Bước 3: các nhánh gọi vào các label xử lý tương ứng, nhưng source hiện chỉ là skeleton, chưa có đoạn `READ`, `WRITE`, `F.WRITE` hay API business update.",
          "Bước 4: nếu `RET.ERROR` được set ở nhánh con thì routine gọi `HANDLE.ERROR`, nạp `ETEXT` và store end error qua `EB.ErrorProcessing.StoreEndError()`.",
          "Bước 5: cuối routine ghi debug log bằng `AA.Framework.LogManager(...)`."
        ],
        flow: [
          "Không thấy source ghi trực tiếp `AA.ARRANGEMENT`, `AA.ACCOUNT.DETAILS` hay bảng condition khác.",
          "Vai trò hiện thấy là khung status + lỗi cho property constraint."
        ]
      }
    ]
  },
  customer: {
    name: "CUSTOMER",
    slug: "customer",
    fields: [
      {
        name: "AA.CUS.CUSTOMER",
        slot: 3,
        details: [
          "Danh sách customer gắn trực tiếp với arrangement.",
          "Check sang `CUSTOMER` và short name; đây là nguồn customer chính để update owner/holder trong arrangement."
        ]
      },
      {
        name: "AA.CUS.CUSTOMER.ROLE",
        slot: 4,
        details: [
          "Vai trò của từng customer trong arrangement, lấy từ `AA.CUSTOMER.ROLE`.",
          "Routine update dùng field này song song với `CUSTOMER` khi ghi `AA.ARRANGEMENT` và `AA.CUSTOMER.ARRANGEMENT`."
        ]
      },
      {
        name: "AA.CUS.TAX.LIABILITY.PERC",
        slot: 5,
        details: [
          "Tỷ lệ nghĩa vụ thuế của từng customer trong cấu trúc đồng sở hữu.",
          "Field này phục vụ phân bổ trách nhiệm thuế theo từng owner/joint holder."
        ]
      },
      {
        name: "AA.CUS.LIMIT.ALLOC.PERC",
        slot: 6,
        details: [
          "Tỷ lệ phân bổ hạn mức cho từng customer.",
          "Dùng khi một arrangement có nhiều customer cùng chia hạn mức."
        ]
      },
      {
        name: "AA.CUS.GL.ALLOC.PERC",
        slot: 7,
        details: [
          "Tỷ lệ phân bổ hạch toán GL theo từng customer.",
          "Field này hỗ trợ tách phần ghi nhận kế toán hoặc báo cáo theo chủ thể."
        ]
      },
      {
        name: "AA.CUS.DELIVERY.REQD",
        slot: 8,
        details: [
          "Cờ yêu cầu phát hành/tạo delivery cho customer tại cấp arrangement.",
          "Source định nghĩa như một cờ yes/no nhập được ở arrangement level."
        ]
      },
      {
        name: "AA.CUS.JS.LIABLE",
        slot: 12,
        details: [
          "Cờ cho biết nhóm limit customer có chịu trách nhiệm liên đới hay không.",
          "Field này đặc biệt phục vụ joint and several liability."
        ]
      },
      {
        name: "AA.CUS.OTHER.PARTY",
        slot: 13,
        details: [
          "Customer đối tác/party liên quan được khai riêng ngoài owner chính.",
          "Field này cho phép gắn thêm customer phụ trong cùng condition."
        ]
      },
      {
        name: "AA.CUS.ROLE",
        slot: 14,
        details: [
          "Vai trò của `OTHER.PARTY`, lấy từ lookup `AA.PARTY.ROLE`.",
          "Giúp phân biệt người bảo lãnh, người liên quan, đại diện, v.v."
        ]
      },
      {
        name: "AA.CUS.NOTES",
        slot: 15,
        details: [
          "Ghi chú tự do gắn với customer line trong hợp đồng.",
          "Source đánh dấu field này là text và personal-data loại gián tiếp."
        ]
      },
      {
        name: "AA.CUS.CRA.CUSTOMER",
        slot: 16,
        details: [
          "Customer sẽ được đưa sang flow CRA.",
          "Routine update CRA dùng field này để quyết định ai được đẩy sang AACRA."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE CUSTOMER",
        routine: "AA.CUSTOMER.UPDATE.b",
        summary: "Action này cập nhật owner/customer của arrangement, cập nhật concat `AA.CUSTOMER.ARRANGEMENT`, trigger dormancy check và cascade xuống drawings khi cần.",
        steps: [
          "Bước 1: routine đọc status AAA, activity class, initiation type, property id, `AA.ARRANGEMENT`, currency và product group từ common.",
          "Bước 2: ở `UNAUTH`, nếu activity thực là `CHANGE-CUSTOMER`, routine lấy `AA.CUS.CUSTOMER` và `AA.CUS.CUSTOMER.ROLE` từ `R.NEW`, rồi gọi `AA.Framework.UpdateArrangement(\"UPDATE\", ..., CUSTOMER.ID, CUSTOMER.ROLES, ..., \"CUSTOMER.CHANGE\", ..., EFFECTIVE.DATE, ...)` để cập nhật owner trên `AA.ARRANGEMENT` cho current/backdated change.",
          "Bước 3: sau đó routine vào `CHECK.UPDATE.CUSTOMER` để đồng bộ file concat `AA.CUSTOMER.ARRANGEMENT` hoặc `AA.CUSTOMER.ARRANGEMENT.NAU` qua `AA.Framework.UpdateCustomerArrangement(...)`; mode được chọn giữa `UNAUTH`, `UNAUTH-DELETE`, `UPDATE`, `DELETE` tùy status AAA.",
          "Bước 4: với `AUTH` của `CHANGE-CUSTOMER`, routine trước hết update customer mới vào concat, gọi `ST.DormancyMonitor.CdmTriggerHandoff(CUSTOMER.ID, \"AA\", \"ACTIVE\", ...)`, rồi đọc property cũ để xác định customer nào bị bỏ ra, gọi `CdmTriggerHandoff(PREV.CUSTOMER.ID, \"AA\", \"CHECK\", ...)`, và delete các customer cũ ra khỏi concat.",
          "Bước 5: với `AUTH-REV` của `CHANGE-CUSTOMER`, routine xóa customer mới khỏi concat, gọi dormancy `CHECK` cho customer mới, đọc record property cũ rồi restore customer cũ vào concat và gọi dormancy `RESET` cho customer cũ.",
          "Bước 6: với arrangement mới hoặc restore arrangement, routine cũng ghi concat customer ở auth; riêng `RESTORE-ARRANGEMENT` còn set `UPDATE.MODE<2> = \"UPDATE.HIST\"` để dọn `AA.CUSTOMER.ARRANGEMENT.HIST`.",
          "Bước 7: nếu product line là `FACILITY` và đang `UNAUTH` `CHANGE-CUSTOMER`, routine gọi `AA.Customer.DrawingsCustomerChange(...)` để cascade customer/role xuống các drawing bên dưới.",
          "Bước 8: ở `AUTH` hoặc `AUTH-REV`, nếu activity có customer-update action thì routine lấy property condition hiện tại rồi gọi `AA.Customer.UpdateCraDetails(...)` để cập nhật AACRA.",
          "Bước 9: các nhánh input/delete/reverse đều gọi `AA.Framework.UpdateChangeCondition()` để track next change."
        ],
        flow: [
          "Cập nhật `AA.ARRANGEMENT` qua `AA.Framework.UpdateArrangement(...)`.",
          "Cập nhật `AA.CUSTOMER.ARRANGEMENT`, `AA.CUSTOMER.ARRANGEMENT.NAU` và hist qua `AA.Framework.UpdateCustomerArrangement(...)`.",
          "Gọi `ST.DormancyMonitor.CdmTriggerHandoff(...)` cho customer mới/cũ khi đổi customer."
        ]
      },
      {
        name: "PROCESS CUSTOMER",
        routine: "AA.CUSTOMER.PROCESS.b",
        summary: "Routine này chạy trong simulation capture để ghi owner/role vào `AA.ARRANGEMENT.SIM` thay vì live arrangement.",
        steps: [
          "Bước 1: set cờ `AA.SIM.CAPTURE = 1`, `SIM.REQD = 1`.",
          "Bước 2: lấy `CUSTOMER.ID` và `CUSTOMER.ROLES` từ `R.NEW`; nếu đang reversal thì lấy từ `PREV.PROP.REC`.",
          "Bước 3: dựng `ARR.ID` với component 2 là simulation flag và component 3 là simulation required.",
          "Bước 4: gọi `AA.Framework.UpdateArrangement(\"UPDATE\", ARR.ID, ..., CUSTOMER.ID, CUSTOMER.ROLES, ..., \"CUSTOMER.CHANGE\", ..., ACTIVITY.EFF.DATE, ...)` để ghi owner/role vào record simulation."
        ],
        flow: [
          "Không đụng live `AA.ARRANGEMENT`.",
          "Ghi bản simulation của arrangement qua `UpdateArrangement` với id mở rộng."
        ]
      },
      {
        name: "DATACAPTURE CUSTOMER",
        routine: "AA.CUSTOMER.DATACAPTURE.b",
        summary: "Record routine của `ACTIVITY.API` dùng narrative của AAA để tự điền note customer khi test/framework data capture.",
        steps: [
          "Bước 1: đọc AAA record local từ `AA.Framework.getC_aalocarractivityrec()`.",
          "Bước 2: lấy narrative tại `ArrActNarrative`, nối thêm hậu tố `-External`.",
          "Bước 3: ghi giá trị đó vào `R.NEW` field `AA.CUS.NOTES` bằng `EB.SystemTables.setRNew(...)`."
        ],
        flow: [
          "Không ghi file business trực tiếp.",
          "Chỉ sửa `R.NEW` trong data-capture pipeline."
        ]
      }
    ]
  },
  dormancy: {
    name: "DORMANCY",
    slug: "dormancy",
    fields: [
      {
        name: "AA.DOM.STATUS",
        slot: 3,
        details: [
          "Trạng thái dormancy mục tiêu hoặc đang áp cho arrangement.",
          "Lookup sang `AA.DORMANCY.STATUS` và là đầu vào chính của các action set/change."
        ]
      },
      {
        name: "AA.DOM.PERIOD",
        slot: 4,
        details: [
          "Số ngày/kỳ không hoạt động trước khi arrangement bị xét dormancy.",
          "Evaluate dùng field này để suy ra status kế tiếp và ngày đánh giá."
        ]
      },
      {
        name: "AA.DOM.NOTICE.DAYS",
        slot: 5,
        details: [
          "Số ngày báo trước khi chuyển sang trạng thái dormancy.",
          "Field này phục vụ reschedule notice activities khi set status mới."
        ]
      },
      {
        name: "AA.DOM.NOTICE.FREQ",
        slot: 6,
        details: [
          "Tần suất phát notice trong giai đoạn dormancy.",
          "Set action dùng field này để tạo lại lịch notice phù hợp với status mới."
        ]
      },
      {
        name: "AA.DOM.CHARGE.FREQUENCY",
        slot: 7,
        details: [
          "Chu kỳ tính charge cho dormancy.",
          "Source set/reschedule dùng field này để tạo lịch charge dormancy."
        ]
      },
      {
        name: "AA.DOM.EXCEPTION.API",
        slot: 8,
        details: [
          "API exception được gọi khi evaluate dormancy không thể áp rule thường.",
          "Check sang `EB.API`."
        ]
      },
      {
        name: "AA.DOM.EXCEPTION.RULE",
        slot: 9,
        details: [
          "Rule gateway dùng để quyết định exception dormancy.",
          "Evaluate gọi rule này trước khi tạo activity set dormancy."
        ]
      },
      {
        name: "AA.DOM.AUTO.RESET.STATUS",
        slot: 10,
        details: [
          "Status sẽ được reset tự động khi có activity hợp lệ.",
          "Field này là đầu ra mục tiêu của các flow auto-reset/manual-reset."
        ]
      },
      {
        name: "AA.DOM.ACTIVITY.INITIATION",
        slot: 15,
        details: [
          "Giới hạn kiểu initiation của activity được tính là active activity.",
          "Evaluate chỉ xét các activity phù hợp tiêu chí này."
        ]
      },
      {
        name: "AA.DOM.ACTIVITY.CLASS",
        slot: 16,
        details: [
          "Nhóm activity class được coi là có tác động đến dormancy.",
          "Đi cùng `ACTIVITY.NAME` để lọc giao dịch active."
        ]
      },
      {
        name: "AA.DOM.ACTIVITY.NAME",
        slot: 17,
        details: [
          "Tên activity cụ thể được tính cho dormancy logic.",
          "Evaluate active-activity date sẽ dùng field này để xác định giao dịch làm reset dormancy."
        ]
      },
      {
        name: "AA.DOM.INCLUDE.INDICATOR",
        slot: 18,
        details: [
          "Cờ cho biết activity/class được tính bao gồm hay loại trừ khi evaluate dormancy.",
          "Field này làm cho cùng một dòng activity rule có thể là include hoặc exclude."
        ]
      },
      {
        name: "AA.DOM.AUTO.RESET.ACTIVITY",
        slot: 19,
        details: [
          "Activity sẽ được tạo khi system auto-reset dormancy.",
          "Flow auto-reset dùng field này để build secondary activity phù hợp."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE DORMANCY",
        routine: "AA.DORMANCY.UPDATE.b",
        summary: "Khởi tạo và đồng bộ trạng thái dormancy của arrangement vào `AA.ACCOUNT.DETAILS`, đồng thời trigger monitor và reschedule activity liên quan.",
        steps: [
          "Bước 1: ở `UNAUTH`, routine lấy status/date/process dormancy mục tiêu rồi set các field dormancy trên account-details update array.",
          "Bước 2: gọi `AA.PaymentSchedule.ProcessAccountDetails(ArrangementId, \"UPDATE\", \"DORMANCY\", UpdateInfo, \"\")` để ghi dormancy fields vào `AA.ACCOUNT.DETAILS`.",
          "Bước 3: gọi `AA.Framework.UpdateChangeCondition()` và `UpdateScheduleActivities` để tạo/cycle lại các activity dormancy phụ.",
          "Bước 4: ở `AUTH`, routine gọi `ST.DormancyMonitor.CdmTriggerHandoff(CustomerId, \"AA\", \"ACTIVE\", ...)` rồi ghi lại dormancy vào `AA.ACCOUNT.DETAILS` theo mode update.",
          "Bước 5: ở `AUTH-REV`, routine gọi `CdmTriggerHandoff(CustomerId, \"AA\", \"CHECK\", ...)` và đảo cập nhật account details bằng `ProcessAccountDetails(ArrangementId, \"REVERSE\", \"DORMANCY\", \"\", \"\")`."
        ],
        flow: [
          "Ghi `AA.ACCOUNT.DETAILS` qua `AA.PaymentSchedule.ProcessAccountDetails(...)`.",
          "Trigger monitor ngoài AA qua `ST.DormancyMonitor.CdmTriggerHandoff(...)`."
        ]
      },
      {
        name: "EVALUATE DORMANCY",
        routine: "AA.DORMANCY.EVALUATE.b",
        summary: "Đánh giá arrangement có phải chuyển sang dormancy hay không bằng cách đọc status hiện tại, activity gần nhất và exception rules.",
        steps: [
          "Bước 1: lấy dormancy status hiện tại bằng `AA.Dormancy.DetermineDormancyStatus(\"CURRENT\", ArrangementId, EffectiveDate, ArrDormancyStatus, \"\", \"\")`.",
          "Bước 2: gọi `AA.Dormancy.GetDormancyBaseDetails(...)` để lấy status kế tiếp, period và rule cần áp.",
          "Bước 3: gọi `AA.Dormancy.EvaluateActiveActivityDate(...)` để kiểm tra có giao dịch active hợp lệ trong khoảng dormancy hay không.",
          "Bước 4: nếu không có active transaction, routine gọi `AA.Dormancy.EvaluateExceptionRules(...)`; nếu rule exception thành công thì không set dormancy.",
          "Bước 5: nếu đủ điều kiện set dormancy, routine tạo secondary activity set-status; nếu không thì lưu exception bằng `AA.Dormancy.DormancyHandleException(ResultType, ResultValue, \"STORE\")`.",
          "Bước 6: sau xử lý, routine update/cycle lại schedule activities cho lần evaluate kế tiếp."
        ],
        flow: [
          "Đọc trạng thái dormancy hiện tại và rule base details.",
          "Không tự ghi account details; nó quyết định có tạo activity set dormancy hay không."
        ]
      },
      {
        name: "SET DORMANCY",
        routine: "AA.DORMANCY.SET.b",
        summary: "Áp status dormancy mới vào account details và tạo lại lịch notice, charge, evaluate theo status đó.",
        steps: [
          "Bước 1: tách status đích từ tên current activity bằng `FIELD(CurrentActivity,\"*\",2)`.",
          "Bước 2: đọc status hiện tại bằng `DetermineDormancyStatus(\"CURRENT\", ...)`.",
          "Bước 3: cập nhật `AA.ACCOUNT.DETAILS` dormancy fields qua `AA.PaymentSchedule.ProcessAccountDetails(ArrangementId, \"UPDATE\", \"DORMANCY\", UpdateInfo, \"\")`.",
          "Bước 4: đọc dormancy details cũ/mới rồi reschedule evaluation, notice và charge activities theo status mới.",
          "Bước 5: ở `AUTH`, routine còn gọi `ST.DormancyMonitor.CdmTriggerHandoff(CustomerId, \"AA\", \"CHECK\", ...)` trước khi hoàn tất update."
        ],
        flow: [
          "Ghi `AA.ACCOUNT.DETAILS`.",
          "Tạo lại `AA.SCHEDULED.ACTIVITY` cho notice/charge/evaluate."
        ]
      }
    ]
  },
  eligibility: {
    name: "ELIGIBILITY",
    slug: "eligibility",
    fields: [
      {
        name: "AA.EL.RULE",
        slot: 3,
        details: [
          "Rule gateway chính dùng để đánh giá eligibility của arrangement.",
          "Đây là rule được maintain/post-process dựa vào outcome của review."
        ]
      },
      {
        name: "AA.EL.FAILURE.TYPE",
        slot: 4,
        details: [
          "Cách phản ứng khi rule fail: `ERROR` hoặc `OVERRIDE`.",
          "Field này quyết định hệ thống chặn activity hay chỉ sinh override."
        ]
      },
      {
        name: "AA.EL.FAILURE.ACTION",
        slot: 5,
        details: [
          "Hành động nghiệp vụ khi eligibility fail, source định nghĩa `CHANGE.PRODUCT`, `CLOSE`, `IGNORE`.",
          "Đây là đầu vào để post-process biết có đổi product hay đóng arrangement hay không."
        ]
      },
      {
        name: "AA.EL.CUSTOMER.ROLE",
        slot: 6,
        details: [
          "Vai trò customer mà eligibility role-rule áp vào.",
          "Cho phép rule chạy riêng theo owner/joint holder/role cụ thể."
        ]
      },
      {
        name: "AA.EL.ROLE.RULE",
        slot: 7,
        details: [
          "Rule gateway riêng cho một vai trò customer.",
          "Field này bổ sung cho `RULE` khi eligibility phải xét theo role cụ thể."
        ]
      },
      {
        name: "AA.EL.ROLE.FAILURE.TYPE",
        slot: 8,
        details: [
          "Kiểu phản ứng khi role-rule fail.",
          "Tách riêng với failure type chung để một role có thể nghiêm ngặt hơn."
        ]
      },
      {
        name: "AA.EL.ROLE.FAILURE.ACTION",
        slot: 9,
        details: [
          "Hành động khi rule của role fail.",
          "Source giữ cùng bộ option như failure action chính."
        ]
      },
      {
        name: "AA.EL.CHANGE.ACTIVITY",
        slot: 10,
        details: [
          "Activity được dùng khi eligibility yêu cầu đổi trạng thái hoặc đổi product.",
          "Field này là cầu nối giữa result eligibility và activity sẽ được trigger."
        ]
      },
      {
        name: "AA.EL.PERIODIC.REVIEW",
        slot: 11,
        details: [
          "Cờ cho biết eligibility có phải được review định kỳ hay không.",
          "Nếu arrangement review mode là `MANUAL` thì maintain action sẽ bỏ qua review định kỳ."
        ]
      },
      {
        name: "AA.EL.REVIEW.FREQUENCY",
        slot: 12,
        details: [
          "Chu kỳ chạy periodic eligibility review.",
          "Maintain action dùng field này để tính `NEXT.CYCLED.DATE`."
        ]
      },
      {
        name: "AA.EL.CUST.STATIC.REVIEW",
        slot: 13,
        details: [
          "Cờ cho biết review có cần xét lại dữ liệu tĩnh customer hay không.",
          "Field này phục vụ các flow đánh giá lại eligibility không phụ thuộc transaction."
        ]
      },
      {
        name: "AA.EL.ELIGIBILE.DEFAULT.PRD",
        slot: 14,
        details: [
          "Product mặc định sẽ rơi về nếu eligibility yêu cầu đổi product.",
          "Check sang `AA.PRODUCT`."
        ]
      },
      {
        name: "AA.EL.LAST.RUN.DATE",
        slot: 15,
        details: [
          "Ngày lần cuối eligibility được chạy.",
          "Source đánh dấu `NOINPUT`, nghĩa là engine cập nhật thay vì người dùng nhập."
        ]
      }
    ],
    actions: [
      {
        name: "MAINTAIN ELIGIBILITY",
        routine: "AA.ELIGIBILITY.MAINTAIN.b",
        summary: "Action này không tự đánh giá rule mà chủ yếu lập lịch periodic review và track change condition cho eligibility.",
        steps: [
          "Bước 1: đọc status AAA, activity id, effective date, arrangement id, product line và property id.",
          "Bước 2: ở `UNAUTH`, routine lấy `PERIODIC.REVIEW` và `REVIEW.FREQUENCY` từ `R.NEW`; nếu arrangement review mode là `MANUAL` thì tắt periodic review.",
          "Bước 3: nếu vẫn phải review định kỳ, routine lấy property `ACCOUNT` bằng `AA.ProductFramework.GetPropertyRecord(...)` để đọc `DATE.CONVENTION`, `DATE.ADJUSTMENT`, `BUS.DAYS`.",
          "Bước 4: gọi `AA.Rules.GetRecalcDate(...)` để tính `NEXT.CYCLED.DATE` từ `LAST.REVIEW.DATE = EFFECTIVE.DATE`.",
          "Bước 5: đặt `MODE = \"CYCLE\"`, `RESET.ACTIVITY = PRODUCT.LINE:*:PERIODIC.ELIGIBILITY:*:ARRANGEMENT`, rồi gọi label `UPDATE.SCHEDULED.ACTIVITY` để ghi lịch review tiếp theo.",
          "Bước 6: ở `DELETE` hoặc `REVERSE`, routine dùng `MODE = \"AMEND\"`, `NEXT.CYCLED.DATE = EFFECTIVE.DATE` để sửa/xóa lịch review đã tạo.",
          "Bước 7: các nhánh đều gọi `AA.Framework.UpdateChangeCondition()` để track lần change eligibility kế tiếp."
        ],
        flow: [
          "Đọc property `ACCOUNT` để tính ngày cycle chuẩn.",
          "Cập nhật `AA.SCHEDULED.ACTIVITY` cho periodic eligibility review."
        ]
      },
      {
        name: "POST.PROCESS ELIGIBILITY",
        routine: "AA.ELIGIBILITY.POST.PROCESS.b",
        summary: "Action hậu xử lý của eligibility dùng để xử lý kết quả review sau khi rule engine đã quyết định outcome.",
        steps: [
          "Bước 1: source property cho thấy action này là nhánh hậu xử lý sau maintain/validate eligibility.",
          "Bước 2: flow này dùng các field `FAILURE.ACTION`, `CHANGE.ACTIVITY`, `ELIGIBILE.DEFAULT.PRD` để quyết định có đổi product, đóng hợp đồng hay bỏ qua.",
          "Bước 3: do batch hiện tại mới đọc sâu `FIELDS` và `MAINTAIN`, phần hậu xử lý được giữ ở mức source-backed theo vai trò của action."
        ],
        flow: [
          "Vai trò chính là áp outcome eligibility sau bước đánh giá rule."
        ]
      }
    ]
  },
  evidence: {
    name: "EVIDENCE",
    slug: "evidence",
    fields: [
      {
        name: "AA.EVI.COVENANT.CATEG",
        slot: 3,
        details: [
          "Nhóm requirement category của covenant.",
          "Field này lấy từ lookup `EV.REQUIREMENT.CATEGORY` và là khóa đầu tiên để phân loại covenant."
        ]
      },
      {
        name: "AA.EVI.COVENANT.EVIDENCE",
        slot: 4,
        details: [
          "Mã evidence requirement chính của covenant.",
          "Check sang `EV.EVIDENCE.REQUIREMENT`."
        ]
      },
      {
        name: "AA.EVI.COVENANT.REL.EVIDENCE",
        slot: 5,
        details: [
          "Evidence requirement liên quan dùng để so sánh hoặc tính covenant.",
          "Field này hỗ trợ các covenant phụ thuộc một evidence khác."
        ]
      },
      {
        name: "AA.EVI.COVENANT.RULE.OPER",
        slot: 6,
        details: [
          "Toán tử so sánh covenant, như nhỏ hơn, lớn hơn, bằng, khác.",
          "Đi cùng `RULE.VALUE` để form điều kiện đạt/chưa đạt."
        ]
      },
      {
        name: "AA.EVI.COVENANT.RULE.VALUE",
        slot: 7,
        details: [
          "Ngưỡng giá trị được dùng trong điều kiện covenant.",
          "Engine evidence sẽ so giá trị thực với field này theo `RULE.OPER`."
        ]
      },
      {
        name: "AA.EVI.COVENANT.START.DATE",
        slot: 8,
        details: [
          "Ngày bắt đầu tính covenant, có thể neo theo start, maturity, renewal, statement, disbursement hoặc offset period.",
          "Source định nghĩa field này bằng kiểu date-pattern `DP`."
        ]
      },
      {
        name: "AA.EVI.COVENANT.FREQUENCY",
        slot: 9,
        details: [
          "Chu kỳ phải cung cấp hoặc đánh giá covenant evidence.",
          "Field này giúp EV framework dựng lịch due/renew cho requirement."
        ]
      },
      {
        name: "AA.EVI.COVENANT.CONSEQ",
        slot: 15,
        details: [
          "Action hệ quả khi covenant không đạt hoặc đến hạn.",
          "Check sang `AA.ACTION`."
        ]
      },
      {
        name: "AA.EVI.CONDITION.CATEG",
        slot: 21,
        details: [
          "Nhóm requirement category của condition evidence.",
          "Vai trò tương tự covenant category nhưng áp cho condition."
        ]
      },
      {
        name: "AA.EVI.CONDITION.EVIDENCE",
        slot: 22,
        details: [
          "Evidence requirement dùng cho condition.",
          "Đây là requirement sẽ được đưa sang EV khi condition được handoff."
        ]
      },
      {
        name: "AA.EVI.CONDITION.DUE.ACTIVITY",
        slot: 23,
        details: [
          "Activity làm cho condition evidence trở thành due.",
          "Action update dùng field này để nhận biết khi activity hiện tại đúng là due activity của condition."
        ]
      },
      {
        name: "AA.EVI.CONDITION.CONSEQ",
        slot: 24,
        details: [
          "Action hệ quả của condition evidence.",
          "Field này liên kết condition evidence với action downstream."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE EVIDENCE",
        routine: "AA.EVIDENCE.UPDATE.b",
        summary: "Auth path handoff definition covenant/condition của property sang EV framework bằng mode `UPDATE`, `AMEND` hoặc `REVERSE` tùy activity và effective date.",
        steps: [
          "Bước 1: routine đọc status AAA, arrangement id, current activity, effective date, AAA id và kiểm tra replay mode bằng `AA.Framework.CheckReplayMode(...)`.",
          "Bước 2: nếu đang replay thì bỏ qua toàn bộ; nếu không thì tiếp tục xử lý.",
          "Bước 3: ở `AUTH`, routine chuẩn hóa effective date: nếu backdated thì dùng `TODAY`, nếu future-dated thì set `SkipHandoff = 1`.",
          "Bước 4: gọi `GET.MODE` để xác định mode handoff. Source map như sau: `NEW-ARRANGEMENT -> UPDATE`, `UPDATE-EVIDENCE` hoặc `DISBURSE-TERM.AMOUNT` kiểm tra EVRS tồn tại để chọn `AMEND` hay `UPDATE`, `CLOSE-ARRANGEMENT -> REVERSE`, còn nếu current activity đúng với `CONDITION.DUE.ACTIVITY` thì mode là `AMEND`.",
          "Bước 5: nếu không skip và có mode, routine gọi `AA.Evidence.ProcessEvidenceUpdate(ArrangementRef, EffectiveDate, ArrActivity, Mode, REvidence, RET.ERROR)` để handoff sang EV.",
          "Bước 6: ở `AUTH-REV`, nếu là arrangement mới thì gọi `ProcessEvidenceUpdate(..., \"REVERSE\", REvidence, ...)`; nếu không phải arrangement mới thì đọc property cũ bằng `AA.Framework.GetPreviousPropertyRecord(...)` rồi gọi `ProcessEvidenceUpdate(..., \"AMEND\", ROldEvidence, ...)` để restore version trước."
        ],
        flow: [
          "Không tự write `EV.*` trong file này.",
          "Handoff toàn bộ sang `AA.Evidence.ProcessEvidenceUpdate(...)`."
        ]
      },
      {
        name: "GET.DATA.ELEMENT.VALUE EVIDENCE",
        routine: "AA.EVIDENCE.GET.DATA.ELEMENT.VALUE.b",
        summary: "Routine phụ trợ để lấy giá trị data element phục vụ evaluate evidence/covenant.",
        steps: [
          "Bước 1: action này được property dùng như API lấy giá trị đầu vào cho evidence evaluation.",
          "Bước 2: vai trò của nó là trả về value của data element thay vì cập nhật condition.",
          "Bước 3: batch này mới đọc sâu `FIELDS` và `UPDATE`; phần API getter được giữ ở mức vai trò đã xác nhận từ source routine name."
        ],
        flow: [
          "Phục vụ lấy dữ liệu cho evaluation, không phải action update file chính."
        ]
      }
    ]
  },
  inheritance: {
    name: "INHERITANCE",
    slug: "inheritance",
    fields: [
      {
        name: "AA.INH.DEFAULT.TARGET.INHERITANCE",
        slot: 8,
        details: [
          "Cờ mặc định cho biết target arrangement có nhận inheritance hay không.",
          "Nếu bật, target side được coi là cho phép kế thừa mà không cần nhập lại từng lần."
        ]
      },
      {
        name: "AA.INH.TARGET.PROPERTY",
        slot: 9,
        details: [
          "Property ở target sẽ nhận dữ liệu kế thừa.",
          "Đây là property đích của flow inherit."
        ]
      },
      {
        name: "AA.INH.SOURCE.PRODUCT",
        slot: 10,
        details: [
          "Product nguồn mà target được phép kế thừa từ đó.",
          "Field này giới hạn inheritance theo source product."
        ]
      },
      {
        name: "AA.INH.SOURCE.PROPERTY",
        slot: 11,
        details: [
          "Property nguồn cung cấp dữ liệu kế thừa.",
          "Target property sẽ lấy dữ liệu từ property này trên source arrangement."
        ]
      },
      {
        name: "AA.INH.TARGET.INHERITANCE",
        slot: 17,
        details: [
          "Cờ bật/tắt inheritance thực tế của target line hiện tại.",
          "Field này là quyết định nghiệp vụ cuối cùng cho target side."
        ]
      },
      {
        name: "AA.INH.DEFAULT.SOURCE.INHERITANCE",
        slot: 22,
        details: [
          "Cờ mặc định cho source side có được dùng làm nguồn inheritance hay không.",
          "Đi cùng `DEF.SOURCE.PROPERTY` và `SOURCE.CURRENCY`."
        ]
      },
      {
        name: "AA.INH.DEF.SOURCE.PROPERTY",
        slot: 23,
        details: [
          "Property nguồn mặc định nếu user không chọn lại cụ thể.",
          "Đây là property mặc định mà target sẽ đọc khi build inheritance."
        ]
      },
      {
        name: "AA.INH.SOURCE.CURRENCY",
        slot: 24,
        details: [
          "Currency nguồn áp cho source inheritance line.",
          "Field này giúp tách inheritance theo nguồn currency cụ thể."
        ]
      },
      {
        name: "AA.INH.SOURCE.INHERITANCE",
        slot: 30,
        details: [
          "Cờ bật/tắt khả năng làm nguồn inheritance của dòng source hiện tại.",
          "Nếu tắt, product/property đó không được dùng để cấp dữ liệu sang target."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE INHERITANCE",
        routine: "AA.INHERITANCE.UPDATE.b",
        summary: "Action này không copy dữ liệu ngay; nó dựng secondary activity `<ProductLine>-INHERIT-ARRANGEMENT` cho các activity đổi source/target/parent/transform đủ điều kiện.",
        steps: [
          "Bước 1: routine đọc status AAA, current activity, effective date, arrangement id, product line, master type, arrangement-link-type và AAA id.",
          "Bước 2: ở `UNAUTH`, routine lấy `ArrActArrangementLinkType` từ AAA rồi xác định `FacilityFlag = 1` nếu product line hiện tại hoặc master type là `FACILITY`.",
          "Bước 3: nếu activity thuộc `CHANGE.SOURCE`, `CHANGE.TARGET`, `CHANGE.PARENT`, `TRANSFORM` và có `FacilityFlag` hoặc `ArrangementLinkType`, routine build `AaaRec` cho secondary activity.",
          "Bước 4: record secondary được set các field: arrangement id, activity = `<ProductLine>*INHERIT*ARRANGEMENT`, effective date, linked activity = AAA hiện tại.",
          "Bước 5: routine gọi `AA.Framework.SecondaryActivityManager(\"APPEND.TO.LIST\", AaaRec)` với cờ `LAST.REQUEST` để append activity inherit vào common list."
        ],
        flow: [
          "Không tự copy property/source data trong file này.",
          "Tạo secondary activity để flow inherit thật chạy ở bước sau."
        ]
      }
    ]
  },
  officers: {
    name: "OFFICERS",
    slug: "officers",
    fields: [
      {
        name: "AA.OFF.PRIMARY.OFFICER",
        slot: 3,
        details: [
          "Officer chính của arrangement.",
          "Check sang `DEPT.ACCT.OFFICER` và dùng làm owner officer chính."
        ]
      },
      {
        name: "AA.OFF.OTHER.OFFICER",
        slot: 4,
        details: [
          "Danh sách officer phụ hoặc bổ sung cho arrangement.",
          "Cho phép gắn nhiều officer ngoài officer chính."
        ]
      },
      {
        name: "AA.OFF.OFFICER.ROLE",
        slot: 5,
        details: [
          "Vai trò của từng officer phụ, lấy từ lookup `AA.OFFICER.ROLE`.",
          "Field này phân biệt advisor, manager, approver, v.v."
        ]
      },
      {
        name: "AA.OFF.NOTES",
        slot: 6,
        details: [
          "Ghi chú text đi kèm dòng officer.",
          "Source đánh dấu đây là personal-data gián tiếp ở ngữ cảnh hợp đồng."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE OFFICERS",
        routine: "AA.OFFICERS.UPDATE.b",
        summary: "Action hiện tại chỉ theo dõi next change condition cho officer property, chưa thấy update bảng business riêng.",
        steps: [
          "Bước 1: đọc status AAA, activity id, effective date, arrangement id và property id.",
          "Bước 2: với `UNAUTH`, `DELETE`, `REVERSE`, routine chỉ gọi `AA.Framework.UpdateChangeCondition()`.",
          "Bước 3: nhánh `AUTH` không có logic update file hay API business trong source hiện tại.",
          "Bước 4: nếu có lỗi phát sinh từ nhánh con, routine store end error và ghi debug log."
        ],
        flow: [
          "Không thấy source ghi `AA.ARRANGEMENT`, `AA.ACCOUNT.DETAILS` hay file officer riêng.",
          "Vai trò hiện thấy là track condition change."
        ]
      }
    ]
  },
  reporting: {
    name: "REPORTING",
    slug: "reporting",
    fields: [
      {
        name: "AA.REP.IAS.CLASSIFICATION",
        slot: 3,
        details: [
          "Phân loại IAS/IFRS của hợp đồng cho mục đích báo cáo kế toán.",
          "Field này là lớp phân loại chính trước khi gắn subtype."
        ]
      },
      {
        name: "AA.REP.IAS.SUBTYPE",
        slot: 4,
        details: [
          "Subtype IFRS phụ thuộc vào `IAS.CLASSIFICATION`.",
          "Source gắn dynamic dependency để subtype được lọc theo classification đã chọn."
        ]
      },
      {
        name: "AA.REP.MARKET.KEY",
        slot: 5,
        details: [
          "Khóa thị trường dùng cho định danh reporting/valuation.",
          "Đi cùng market margin để dựng dữ liệu thị trường."
        ]
      },
      {
        name: "AA.REP.MARKET.MARGIN",
        slot: 6,
        details: [
          "Biên độ thị trường dùng cho báo cáo hoặc định giá.",
          "Field này là giá trị số đi cùng `MARGIN.OPERAND`."
        ]
      },
      {
        name: "AA.REP.MARGIN.OPERAND",
        slot: 7,
        details: [
          "Cách áp biên độ thị trường, source định nghĩa `ADD` hoặc `SUB`.",
          "Xác định market margin được cộng hay trừ vào market key/base rate."
        ]
      },
      {
        name: "AA.REP.ACTIVITY.NAME",
        slot: 8,
        details: [
          "Activity sẽ được gắn cờ có tạo cashflow/reporting impact.",
          "Mỗi dòng activity có thể đi kèm cờ `CASH.FLOW` và property loại trừ EIR."
        ]
      },
      {
        name: "AA.REP.CASH.FLOW",
        slot: 9,
        details: [
          "Cờ cho biết activity có phải trigger cashflow engine hay không.",
          "Đây là field chính để action update cashflow map event."
        ]
      },
      {
        name: "AA.REP.PROPERTY",
        slot: 10,
        details: [
          "Property liên quan đến dòng activity reporting/cashflow.",
          "Dùng để xác định property nào bị loại khỏi EIR."
        ]
      },
      {
        name: "AA.REP.EXCLUDE.EIR",
        slot: 11,
        details: [
          "Cờ loại trừ property khỏi EIR/cashflow processing.",
          "Source dùng field này để điều chỉnh build cashflow/reporting."
        ]
      },
      {
        name: "AA.REP.EXPECTED.TERM",
        slot: 12,
        details: [
          "Kỳ hạn kỳ vọng dùng trong báo cáo hoặc cashflow projection.",
          "Field có kiểu `PERIOD`."
        ]
      },
      {
        name: "AA.REP.DEALER.DESK",
        slot: 15,
        details: [
          "Dealer desk gắn với arrangement cho position management.",
          "Position-management handoff đọc field này để build PM payload."
        ]
      },
      {
        name: "AA.REP.PROPERTY.CLASS",
        slot: 16,
        details: [
          "Property class được map position class cho PM.",
          "Field này đứng trên `PROPERTY.ID` để cấu hình theo class hoặc theo property cụ thể."
        ]
      },
      {
        name: "AA.REP.PROPERTY.ID",
        slot: 19,
        details: [
          "Property cụ thể được map sang position class.",
          "Dùng khi rule position không chỉ áp cho cả class."
        ]
      },
      {
        name: "AA.REP.POS.CLASS.START",
        slot: 22,
        details: [
          "Position class dùng cho dòng cashflow tại thời điểm bắt đầu.",
          "Flow PM handoff lấy field này để gắn class cho activity start."
        ]
      },
      {
        name: "AA.REP.POS.CLASS.MATURITY",
        slot: 23,
        details: [
          "Position class cho maturity event.",
          "PM dùng field này để phân loại cashflow đáo hạn."
        ]
      },
      {
        name: "AA.REP.APR.TYPE",
        slot: 40,
        details: [
          "Loại APR cần đồng bộ giữa reporting property, account property và `EB.CASHFLOW`.",
          "Integrity check dùng field này để đối chiếu APR rate."
        ]
      },
      {
        name: "AA.REP.LINKED.INT.PROPERTY",
        slot: 91,
        details: [
          "Interest property liên kết với reporting condition.",
          "Field này hỗ trợ các case savings/apr khi cần nối reporting với property lãi cụ thể."
        ]
      }
    ],
    actions: [
      {
        name: "UPDATE REPORTING",
        routine: "AA.REPORTING.UPDATE.b",
        summary: "Action nền của reporting hiện chủ yếu track next change condition; source chưa tự cập nhật bảng reporting riêng ở routine này.",
        steps: [
          "Bước 1: đọc status AAA, activity id, effective date, arrangement id và property id.",
          "Bước 2: ở `UNAUTH`, `DELETE`, `REVERSE`, routine chỉ gọi `AA.Framework.UpdateChangeCondition()`.",
          "Bước 3: nhánh `AUTH` hiện không có đoạn ghi file business riêng.",
          "Bước 4: routine ghi debug log và store error nếu có."
        ],
        flow: [
          "Vai trò hiện thấy là change-condition tracking cho reporting property."
        ]
      },
      {
        name: "UPDATE.CASHFLOW REPORTING",
        routine: "AA.REPORTING.UPDATE.CASHFLOW.b",
        summary: "Action này rebuild hoặc reverse cashflow của hợp đồng bằng cách map activity thành cashflow events rồi handoff sang cashflow engine.",
        steps: [
          "Bước 1: đọc status AAA, full status, current action, effective date cuối (`END.DATE`), arrangement id, `AA.ARRANGEMENT`, original contract date và linked account.",
          "Bước 2: `GET.CASHFLOW.START.DATE` đọc master activity từ common `AA.Framework.getAaMasterActivity()` để lấy `START.DATE`; nếu không có thì dùng `END.DATE`.",
          "Bước 3: ở `UNAUTH`, routine lấy `c_arractivitylist`, gọi `AA.Reporting.MapCashflowEvents(...)` để map danh sách activity thành `EVENTS`, rồi gọi `AA.Reporting.UpdateCashflow(ARRANGEMENT.ID, START.DATE, END.DATE, \"INP\", EVENTS, RET.ERROR)`.",
          "Bước 4: ở `DELETE`, routine gọi `UpdateCashflow(..., \"DEL\", \"\", ...)` để xóa/update handoff cashflow tương ứng.",
          "Bước 5: ở `REVERSE`, routine gọi `AA.Rules.GetActivityCount(...)` để đếm cashflow activities từ value date đến effective date. Nếu đây là reversal của cashflow đầu tiên thì chọn `CALL.MODE = \"REV\"` và reverse cashflow; nếu không thì xử lý lại như input mode để amend record.",
          "Bước 6: với takeover contract, routine còn gọi `CW.CashFlow.CheckCashflowRecord(\"IS.TAKEOVER\", CONTRACT.ID, RESULT, \"\")` để quyết định reversal thật hay chỉ amend."
        ],
        flow: [
          "Handoff sang cashflow engine qua `AA.Reporting.UpdateCashflow(...)`.",
          "Đọc `AA.ACCOUNT.DETAILS` value date và dùng `CW.CashFlow` để quyết định reversal case."
        ]
      },
      {
        name: "UPDATE.STAGE REPORTING",
        routine: "AA.REPORTING.UPDATE.STAGE.b",
        summary: "Auth path cập nhật risk stage của contract vào `AA.ACCOUNT.DETAILS` từ `EB.CASHFLOW`.",
        steps: [
          "Bước 1: ở `AUTH`, routine đọc `EB.CASHFLOW` hiện tại bằng `AC.IFRS.getREbCashflow()`.",
          "Bước 2: đọc `AA.ACCOUNT.DETAILS` của arrangement bằng `AA.PaymentSchedule.AccountDetails.Read(ARRANGEMENT.ID, \"\")`.",
          "Bước 3: gán `AdRiskStage = CshfStage` từ `EB.CASHFLOW`.",
          "Bước 4: ghi lại account details bằng `AA.Framework.setAccountDetails(R.CONTRACT)`."
        ],
        flow: [
          "Đọc `EB.CASHFLOW`.",
          "Cập nhật trực tiếp `AA.ACCOUNT.DETAILS` field risk stage."
        ]
      },
      {
        name: "TRIGGER REPORTING",
        routine: "AA.REPORTING.TRIGGER.b",
        summary: "Finalize hook để xác định arrangement nào cần position-management processing và ghi list file cho PM service.",
        steps: [
          "Bước 1: đọc status AAA, activity id, effective date, arrangement id và external action details từ common.",
          "Bước 2: gọi `AA.Reporting.CheckPmProcessRequired(RCompany, ExternalActionDetails, EffectiveDate, ArrangementProcessInfo, ReturnError)` để lấy danh sách arrangement cần PM processing.",
          "Bước 3: loop từng `arrProcessInfo`, tách `ArrangementId`, gọi `AA.Reporting.DeterminePmMode(...)` để xác định action `UPDATE` hay `DELETE` phía PM.",
          "Bước 4: nếu action hợp lệ và không bị chặn bởi status `AUTH`, routine dựng `RecordList = arrProcessInfo:\"\\\":Action` rồi gọi `PM.Engine.UpdateListWrite(ArrangementId, RecordList, \"\")`."
        ],
        flow: [
          "Ghi list file của PM engine qua `PM.Engine.UpdateListWrite(...)`.",
          "Không build payload PM chi tiết trong routine này."
        ]
      },
      {
        name: "POSITION.MANAGEMENT REPORTING",
        routine: "AA.REPORTING.POSITION.MANAGEMENT.b",
        summary: "PM service gọi routine này để lấy dữ liệu position/cashflow từ AA rồi handoff sang PM transaction activity.",
        steps: [
          "Bước 1: validate `ArrangementId` và `Action`, rồi gọi `AA.Framework.GetArrangement(...)` để đọc live arrangement.",
          "Bước 2: nếu arrangement start date lớn hơn effective date hiện tại thì routine đẩy effective date lên start date để đọc đúng property future-dated.",
          "Bước 3: gọi `AA.ProductFramework.GetPropertyRecord(..., \"ACCOUNT\", ...)` để đọc account property, lấy account property id, currency market, arrangement currency, position type, account number.",
          "Bước 4: đọc `CURRENCY` để lấy `CurrencyBasis`, rồi gọi `AA.Reporting.GetPositionManagementDetails(...)` lấy reporting record và danh sách interest properties; từ đây routine lấy `DEALER.DESK`.",
          "Bước 5: gọi `AA.Interest.GetResetConditions(...)`, `AA.Reporting.GetCashflowDetails(...)` cho cả `COMMITMENT` và `DISBURSAL`, merge cashflow, rồi gọi `AA.Reporting.setAssetLiab(...)` để set asset/liability cho từng dòng.",
          "Bước 6: sau đó routine tiếp tục set settlement info, interest details, build position class, build maturity activity và cuối cùng handoff sang PM trong `CallAaPmHandoff`.",
          "Bước 7: nếu action là `DELETE`, routine đổi action thành `D` rồi handoff delete sang PM."
        ],
        flow: [
          "Đọc `AA.ARRANGEMENT`, `ACCOUNT` property, `CURRENCY`, reporting details, interest reset conditions và cashflow details.",
          "Handoff payload chi tiết sang PM service sau khi dựng xong position classes."
        ]
      },
      {
        name: "INTEGRITY.CHECK REPORTING",
        routine: "AA.REPORTING.INTEGRITY.CHECK.b",
        summary: "Kiểm tra APR type/rate giữa reporting property, account property và `EB.CASHFLOW`; nếu lệch thì ghi problem category mức cao.",
        steps: [
          "Bước 1: nhận `arrInfo`, tách arrangement id, `AA.ARRANGEMENT`, account property id, reporting property id và account id.",
          "Bước 2: đọc reporting property và account property bằng `AA.Framework.GetArrangementConditions(...)`.",
          "Bước 3: lấy danh sách `APR.TYPE` từ reporting property, rồi nếu product `CW` có cài đặt thì gọi `CW.CashFlow.StFetchAprRate(accountId, AprTypes, \"\", AprRates, Err, \"\")` để lấy APR rate trong cashflow.",
          "Bước 4: loop từng apr type; nếu apr type không có trong account property thì ghi lỗi `Apr Type not updated in Account property class`.",
          "Bước 5: nếu apr type có nhưng `AcAprRate` khác rate lấy từ cashflow thì ghi lỗi `Annual Percentage Rate updated in Account property class differs from rate updated in EB.CASHFLOW`.",
          "Bước 6: lỗi được đẩy vào `problemCategory`, `problemDetails` và gọi `AA.Util.CobEodError(...)` khi là lỗi EOD."
        ],
        flow: [
          "Đọc `AA` condition records và `EB/CW` cashflow APR rate.",
          "Không sửa dữ liệu business; chỉ báo integrity problem."
        ]
      }
    ]
  }
};
