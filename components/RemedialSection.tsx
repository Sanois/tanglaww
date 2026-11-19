import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { MutableRefObject, useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Remedial quiz settings for the quiz editor (same rules as the website).
// Only the chosen reviewees see a remedial quiz. The list shows only the
// reviewees below 60% on the topic (plus anyone already saved on this
// quiz), all ticked. The admin can untick names.

export const AT_RISK_CUTOFF = 60;

interface Topic {
  topic_id: number;
  topicName: string;
  parent_id: number | null;
}

interface Candidate {
  studentId: number;
  name: string;
  mastery: number | null;
  atRisk: boolean;
  inList?: boolean;
}

const C = {
  primary: "#0D2A94",
  card: "#EEF1F6",
  border: "#C9D0DD",
  text: "#1A1A2E",
  muted: "#6B7280",
  danger: "#C0392B",
  dangerBg: "#FDECEA",
};

export default function RemedialSection(props: {
  enabled: boolean;
  onEnabledChange: (v: boolean) => void;
  topics: Topic[];
  topicId: number | null;
  onTopicChange: (id: number | null) => void;
  chosen: number[];
  onChosenChange: (ids: number[]) => void;
  keepSavedList: MutableRefObject<boolean>;
  savedIds: number[];
  assessmentId: number | null;
}) {
  const {
    enabled,
    topics,
    topicId,
    chosen,
    onChosenChange,
    keepSavedList,
    savedIds,
    assessmentId,
  } = props;
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const majors = topics.filter((t) => t.parent_id === null);
  const minorsOf = (id: number) => topics.filter((t) => t.parent_id === id);

  useEffect(() => {
    if (!enabled || !topicId) {
      setCandidates([]);
      return;
    }
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      const { data, error: rpcError } = await supabase.rpc(
        "get_remedial_candidates",
        { p_topic_id: topicId, p_assessment_id: assessmentId },
      );
      if (!active) return;
      setLoading(false);
      if (rpcError) {
        setError(rpcError.message);
        return;
      }
      const rows = (data as Candidate[]) ?? [];
      setCandidates(rows);
      // A new topic starts with its at-risk reviewees ticked.
      // A saved remedial keeps its saved list the first time it loads.
      if (!keepSavedList.current) {
        onChosenChange(rows.filter((r) => r.atRisk).map((r) => r.studentId));
      }
      keepSavedList.current = false;
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, topicId]);

  const shown = candidates.filter(
    (r) => r.atRisk || r.inList || savedIds.includes(r.studentId),
  );
  const toggle = (id: number) =>
    onChosenChange(
      chosen.includes(id) ? chosen.filter((x) => x !== id) : [...chosen, id],
    );

  const topicChip = (id: number, label: string) => (
    <TouchableOpacity
      key={id}
      style={[s.chip, topicId === id && s.chipActive]}
      onPress={() => props.onTopicChange(id)}
    >
      <Text style={[s.chipText, topicId === id && s.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={s.card}>
      <View style={s.row}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={s.title}>Remedial quiz</Text>
          <Text style={s.desc}>
            Only the reviewees you choose below can see and take this quiz. It
            does not count toward course progress.
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={props.onEnabledChange}
          trackColor={{ true: "#2F459B", false: "#D0D4DC" }}
          thumbColor="white"
        />
      </View>

      {enabled && (
        <>
          <Text style={s.label}>Topic they are weak in:</Text>
          {majors.map((m) => (
            <View key={m.topic_id} style={{ marginBottom: 8 }}>
              <Text style={s.group}>{m.topicName}</Text>
              <View style={s.chipWrap}>
                {topicChip(m.topic_id, `All of ${m.topicName}`)}
                {minorsOf(m.topic_id).map((t) =>
                  topicChip(t.topic_id, t.topicName),
                )}
              </View>
            </View>
          ))}

          {topicId && (
            <>
              <Text style={s.label}>
                At-risk reviewees ({chosen.length} of {shown.length} chosen)
              </Text>
              <Text style={s.desc}>
                Only reviewees below {AT_RISK_CUTOFF}% on this topic are listed.
                They are all ticked; untick anyone who should not get this quiz.
              </Text>
              {loading && (
                <ActivityIndicator color={C.primary} style={{ margin: 10 }} />
              )}
              {!!error && <Text style={s.error}>{error}</Text>}
              {!loading && !error && shown.length === 0 && (
                <Text style={s.desc}>
                  No reviewee is below {AT_RISK_CUTOFF}% on this topic, so there
                  is no one to give this remedial to yet.
                </Text>
              )}
              {!loading && shown.length > 0 && (
                <View style={s.list}>
                  {shown.map((r, i) => (
                    <TouchableOpacity
                      key={r.studentId}
                      style={[s.item, i > 0 && s.itemBorder]}
                      onPress={() => toggle(r.studentId)}
                    >
                      <Ionicons
                        name={
                          chosen.includes(r.studentId)
                            ? "checkbox"
                            : "square-outline"
                        }
                        size={20}
                        color={C.primary}
                      />
                      <Text style={s.name} numberOfLines={1}>
                        {r.name}
                      </Text>
                      {r.atRisk ? (
                        <View style={s.riskTag}>
                          <Text style={s.riskText}>At risk</Text>
                        </View>
                      ) : (
                        <Text style={s.muted}>No longer at risk</Text>
                      )}
                      <Text style={s.mastery}>
                        {r.mastery === null ? "No data" : `${r.mastery}%`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderRadius: 10,
    padding: 14,
    marginTop: 20,
  },
  row: { flexDirection: "row", alignItems: "center" },
  title: { fontSize: 14, fontWeight: "600", color: C.primary },
  desc: { fontSize: 12, color: C.muted, marginTop: 2, marginBottom: 6 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
    marginTop: 14,
    marginBottom: 6,
  },
  group: { fontSize: 12, fontWeight: "700", color: C.muted, marginBottom: 4 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "white",
  },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { fontSize: 12, color: C.text },
  chipTextActive: { color: "white", fontWeight: "600" },
  error: { fontSize: 13, color: C.danger },
  list: {
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  itemBorder: { borderTopWidth: 1, borderTopColor: "#EEF0F4" },
  name: { flex: 1, fontSize: 13, color: C.text },
  riskTag: {
    backgroundColor: C.dangerBg,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  riskText: { fontSize: 11, fontWeight: "600", color: C.danger },
  muted: { fontSize: 11, color: C.muted },
  mastery: { width: 54, textAlign: "right", fontSize: 12, color: C.text },
});
