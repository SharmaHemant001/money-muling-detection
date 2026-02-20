def generate_ring_summary_table(fraud_rings):

    table_html = """
    <h2>Fraud Ring Summary</h2>
    <table border="1" style="border-collapse: collapse; width:100%;">
        <thead style="background-color:#f2f2f2;">
            <tr>
                <th>Ring ID</th>
                <th>Pattern Type</th>
                <th>Member Count</th>
                <th>Risk Score</th>
                <th>Member Account IDs</th>
            </tr>
        </thead>
        <tbody>
    """

    for ring in fraud_rings:
        members = ", ".join(ring["member_accounts"])
        member_count = len(ring["member_accounts"])

        table_html += f"""
            <tr>
                <td>{ring['ring_id']}</td>
                <td>{ring['pattern_type']}</td>
                <td>{member_count}</td>
                <td>{ring['risk_score']}</td>
                <td>{members}</td>
            </tr>
        """

    table_html += """
        </tbody>
    </table>
    """

    return table_html
