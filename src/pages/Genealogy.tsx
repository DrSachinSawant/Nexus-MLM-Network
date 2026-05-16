import { useState } from "react";
import { trpc } from "@/providers/trpc";
import AppShell from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GitBranch, ZoomIn, ZoomOut, Maximize2, Search, User,
  ChevronDown, ChevronUp, Users, DollarSign, Award,
} from "lucide-react";

interface MemberNode {
  id: number;
  memberId: string | null;
  name: string | null;
  status: string | null;
  rank: string;
  rankColor: string;
  level: number | null;
  teamSize: number | null;
  directCount: number | null;
  businessVolume: string | number | null;
  joinDate: Date | null;
  children: MemberNode[];
}

export default function Genealogy() {
  const { data: treeData, isLoading } = trpc.genealogy.getTree.useQuery({ depth: 3 });
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const toggleNode = (nodeId: number) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  // Build tree structure
  const buildTree = (): MemberNode[] => {
    if (!treeData?.root) return [];

    const memberMap = new Map<number, MemberNode>();
    const childrenMap = new Map<number, number[]>();

    // Add root
    memberMap.set(treeData.root.id, {
      ...treeData.root,
      rank: treeData.root.rank || "New Member",
      rankColor: "#2962FF",
      children: [],
    });

    // Add all members
    for (const m of treeData.members || []) {
      if (m.user) {
        memberMap.set(m.userId, {
          id: m.userId,
          memberId: m.user.memberId,
          name: m.user.name,
          status: m.user.status,
          rank: m.user.rank || "New Member",
          rankColor: m.user.rankColor || "#90A4AE",
          level: m.level,
          teamSize: m.teamSize,
          directCount: m.directCount,
          businessVolume: m.totalBusinessVolume,
          joinDate: null,
          children: [],
        });
      }
    }

    // Build parent-child relationships
    for (const m of treeData.members || []) {
      const parentId = m.parentId || treeData.root.id;
      if (!childrenMap.has(parentId)) childrenMap.set(parentId, []);
      childrenMap.get(parentId)!.push(m.userId);
    }

    // Recursively build tree
    const buildChildren = (parentId: number): MemberNode[] => {
      const childIds = childrenMap.get(parentId) || [];
      return childIds
        .map(id => memberMap.get(id))
        .filter(Boolean)
        .map(node => ({
          ...node!,
          children: buildChildren(node!.id),
        }));
    };

    const root = memberMap.get(treeData.root.id);
    if (root) {
      root.children = buildChildren(root.id);
      return [root];
    }
    return [];
  };

  const tree = buildTree();

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A237E] flex items-center gap-2">
          <GitBranch className="w-6 h-6 text-[#2962FF]" />
          Genealogy Tree
        </h1>
        <p className="text-[#5C6BC0] mt-1">View your network hierarchy</p>
      </div>

      {/* Toolbar */}
      <Card className="border-[#E3E8EE] shadow-sm mb-4">
        <CardContent className="p-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#90A4AE]" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search member..."
                className="pl-9 h-9 border-[#E3E8EE] text-sm"
              />
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-9 border-[#E3E8EE]"><ZoomIn className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" className="h-9 border-[#E3E8EE]"><ZoomOut className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" className="h-9 border-[#E3E8EE]"><Maximize2 className="w-4 h-4" /></Button>
            </div>
            <div className="flex items-center gap-4 text-xs ml-auto">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]" />Active</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#FF9800]" />Pending</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#F44336]" />Inactive</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tree Canvas */}
      <Card className="border-[#E3E8EE] shadow-sm min-h-[500px] overflow-auto">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2962FF]" />
            </div>
          ) : tree.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-[#90A4AE]">
              <GitBranch className="w-12 h-12 mb-3" />
              <p>No network data available</p>
              <p className="text-sm">Start building your network by referring new members</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {tree.map(node => (
                <TreeNode key={node.id} node={node} expandedNodes={expandedNodes} toggleNode={toggleNode} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}

function TreeNode({ node, expandedNodes, toggleNode, level = 0 }: {
  node: MemberNode;
  expandedNodes: Set<number>;
  toggleNode: (id: number) => void;
  level?: number;
}) {
  const isExpanded = expandedNodes.has(node.id);
  const hasChildren = node.children && node.children.length > 0;
  const statusColor = node.status === "ACTIVE" ? "#4CAF50" : node.status === "PENDING" ? "#FF9800" : "#F44336";

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <div
        className="relative flex flex-col items-center p-3 bg-white border-2 rounded-xl cursor-pointer transition-all hover:shadow-lg min-w-[180px]"
        style={{ borderColor: statusColor }}
        onClick={() => hasChildren && toggleNode(node.id)}
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-9 h-9 rounded-full bg-[#E8EFFF] flex items-center justify-center">
            <User className="w-4 h-4 text-[#2962FF]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1A237E] truncate max-w-[120px]">{node.name || "Unknown"}</p>
            <p className="text-[10px] text-[#90A4AE]">{node.memberId}</p>
          </div>
        </div>
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${node.rankColor}15`, color: node.rankColor }}
        >
          {node.rank}
        </span>
        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#5C6BC0]">
          <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{node.teamSize || 0}</span>
          <span className="flex items-center gap-0.5"><DollarSign className="w-3 h-3" />{node.businessVolume || 0}</span>
        </div>
        {hasChildren && (
          <button className="mt-1 text-[#90A4AE] hover:text-[#2962FF]">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="mt-4 flex flex-col items-center">
          <div className="w-px h-6 bg-[#E3E8EE]" />
          <div className="flex gap-4">
            {node.children!.map(child => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="w-px h-4 bg-[#E3E8EE]" />
                <TreeNode node={child} expandedNodes={expandedNodes} toggleNode={toggleNode} level={level + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
